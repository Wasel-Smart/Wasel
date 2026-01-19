/**
 * Wasel Intermodal Journey Service
 * 
 * Innovating through combined mobility while respecting 
 * Middle Eastern cultural diversity & climate challenges.
 */

import { ServiceFactory, Location } from './serviceFactory';

export interface RouteSegment {
    type: 'scooter' | 'carpool' | 'walk';
    from: Location;
    to: Location;
    durationMinutes: number;
    distanceKm: number;
    data?: any;
    isFemaleOnly?: boolean;
}

export interface IntermodalJourney {
    id: string;
    segments: RouteSegment[];
    totalPrice: number;
    totalDurationMinutes: number;
    totalDistanceKm: number;
    co2SavedKg: number;
    comfortScore: number; // 0-10 based on heat/walking
}

class IntermodalService {
    /**
     * Plans a journey from A to B considering cultural privacy and climate comfort.
     */
    async planJourney(
        from: Location,
        to: Location,
        preferences: {
            femaleOnly?: boolean;
            prayerTimeStop?: boolean;
            maxWalkingDistance?: number;
        } = {}
    ): Promise<IntermodalJourney[]> {
        console.log('Planning Intermodal Journey...', { from, to, preferences });

        // 1. Discover potential carpool legs for the long distance
        const carpoolResult = await ServiceFactory.discover('carpool', {
            from: from.address,
            to: to.address,
            isFemaleOnly: preferences.femaleOnly
        });

        const options: IntermodalJourney[] = [];

        if (carpoolResult.success && carpoolResult.data) {
            for (const trip of carpoolResult.data) {
                // Build a journey around this carpool trip
                const journey = await this.buildJourneyWithTrip(from, to, trip, preferences);
                if (journey) options.push(journey);
            }
        }

        // 2. Add a pure Scooter-only option if distance is short
        const distance = this.calculateDistance(from, to);
        if (distance < 5) {
            const scooterJourney = await this.buildScooterOnlyJourney(from, to, distance);
            if (scooterJourney) options.push(scooterJourney);
        }

        return options.sort((a, b) => b.comfortScore - a.comfortScore);
    }

    private async buildJourneyWithTrip(
        start: Location,
        end: Location,
        trip: any,
        prefs: any
    ): Promise<IntermodalJourney | null> {
        const segments: RouteSegment[] = [];

        // Segment 1: Get to the driver (Scooter or Walk)
        const tripStart = { lat: trip.from_lat, lng: trip.from_lng };
        const distToTrip = this.calculateDistance(start, tripStart);

        if (distToTrip > 0.3) { // Use scooter if more than 300m
            segments.push({
                type: 'scooter',
                from: start,
                to: tripStart,
                distanceKm: distToTrip,
                durationMinutes: Math.ceil(distToTrip * 4) // 15km/h
            });
        } else {
            segments.push({
                type: 'walk',
                from: start,
                to: tripStart,
                distanceKm: distToTrip,
                durationMinutes: Math.ceil(distToTrip * 12) // 5km/h
            });
        }

        // Segment 2: The Carpool Ride
        segments.push({
            type: 'carpool',
            from: tripStart,
            to: { lat: trip.to_lat, lng: trip.to_lng },
            distanceKm: this.calculateDistance(tripStart, { lat: trip.to_lat, lng: trip.to_lng }),
            durationMinutes: 30, // Mock
            data: trip,
            isFemaleOnly: trip.is_female_only
        });

        // Segment 3: To final destination
        const tripEnd = { lat: trip.to_lat, lng: trip.to_lng };
        const distToEnd = this.calculateDistance(tripEnd, end);
        if (distToEnd > 0.1) {
            segments.push({
                type: 'walk',
                from: tripEnd,
                to: end,
                distanceKm: distToEnd,
                durationMinutes: Math.ceil(distToEnd * 12)
            });
        }

        const totalDist = segments.reduce((acc, s) => acc + s.distanceKm, 0);
        const totalTime = segments.reduce((acc, s) => acc + s.durationMinutes, 0);
        const comfort = this.calculateComfortScore(segments);

        return {
            id: Math.random().toString(36).substr(2, 9),
            segments,
            totalPrice: (trip.price_per_seat || 10) + (distToTrip > 0.3 ? 5 : 0),
            totalDurationMinutes: totalTime,
            totalDistanceKm: totalDist,
            co2SavedKg: totalDist * 0.1, // Mock
            comfortScore: comfort
        };
    }

    private async buildScooterOnlyJourney(from: Location, to: Location, dist: number): Promise<IntermodalJourney> {
        const segments: RouteSegment[] = [{
            type: 'scooter',
            from,
            to,
            distanceKm: dist,
            durationMinutes: Math.ceil(dist * 4)
        }];

        return {
            id: 'scooter-only',
            segments,
            totalPrice: 5 + (dist * 1.5),
            totalDurationMinutes: Math.ceil(dist * 4),
            totalDistanceKm: dist,
            co2SavedKg: dist * 0.12,
            comfortScore: 8 // Highly comfortable but watch for heat
        };
    }

    private calculateComfortScore(segments: RouteSegment[]): number {
        let score = 10;
        const hour = new Date().getHours();
        const isPeakHeat = hour >= 10 && hour <= 16;

        for (const seg of segments) {
            if (seg.type === 'walk') {
                if (seg.distanceKm > 0.5) score -= 3;
                if (isPeakHeat && seg.distanceKm > 0.2) score -= 4; // Penalty for heat walking
            }
        }
        return Math.max(0, score);
    }

    private calculateDistance(loc1: Location, loc2: Location): number {
        const R = 6371;
        const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
        const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}

export const intermodalService = new IntermodalService();
export default intermodalService;
