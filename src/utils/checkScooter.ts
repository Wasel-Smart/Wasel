import { scooterService } from '../services/scooterService';

export async function checkScooterService() {
    console.log('--- Checking Scooter Service ---');

    try {
        // 1. Get nearby scooters
        console.log('Fetching nearby scooters...');
        const scooters = await scooterService.getNearbyScooters(25.2048, 55.2708, 5);
        console.log(`Found ${scooters.length} scooters.`);

        if (scooters.length > 0) {
            const scooter = scooters[0];
            console.log(`Checking scooter ${scooter.code} (Status: ${scooter.status}, Battery: ${scooter.battery}%)`);

            // 2. Test unlock (will fail if not authenticated, but we want to see the error)
            console.log('Attempting to unlock scooter...');
            try {
                const rental = await scooterService.unlockScooter(scooter.id);
                console.log('Unlock successful!', rental.id);

                // 3. Test end ride
                console.log('Ending ride...');
                const result = await scooterService.endRide(rental.id, { lat: 25.2050, lng: 55.2710 });
                console.log(`Ride ended. Total cost: AED ${result.cost}`);
            } catch (err: any) {
                console.log(`Unlock/EndRide failed (expected if not logged in): ${err.message}`);
            }
        }
    } catch (error: any) {
        console.error('Service check failed:', error.message);
    }

    console.log('--- Check Complete ---');
}
