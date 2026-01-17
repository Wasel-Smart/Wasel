import { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { 
  Shield, 
  CheckCircle, 
  Upload, 
  Phone, 
  Mail, 
  CreditCard,
  Camera,
  FileText,
  AlertCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';

type VerificationStatus = 'not_started' | 'pending' | 'approved' | 'rejected';

interface VerificationItem {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: any;
  status: VerificationStatus;
  required: boolean;
  rejectionReason?: string;
}

export function VerificationCenter() {
  const [verifications, setVerifications] = useState<VerificationItem[]>([
    {
      id: 'phone',
      name: 'Phone Number',
      nameAr: 'رقم الهاتف',
      description: 'Verify your phone number via SMS',
      descriptionAr: 'تحقق من رقم هاتفك عبر الرسائل القصيرة',
      icon: Phone,
      status: 'approved',
      required: true
    },
    {
      id: 'email',
      name: 'Email Address',
      nameAr: 'البريد الإلكتروني',
      description: 'Verify your email address',
      descriptionAr: 'تحقق من عنوان بريدك الإلكتروني',
      icon: Mail,
      status: 'approved',
      required: true
    },
    {
      id: 'national_id',
      name: 'National ID / Emirates ID',
      nameAr: 'بطاقة الهوية الوطنية / هوية الإمارات',
      description: 'Upload a photo of your government-issued ID',
      descriptionAr: 'قم بتحميل صورة من بطاقة الهوية الحكومية',
      icon: CreditCard,
      status: 'pending',
      required: true
    },
    {
      id: 'drivers_license',
      name: "Driver's License",
      nameAr: 'رخصة القيادة',
      description: 'Required to offer rides as a driver',
      descriptionAr: 'مطلوب لتقديم الرحلات كسائق',
      icon: FileText,
      status: 'not_started',
      required: false
    },
    {
      id: 'selfie',
      name: 'Selfie Verification',
      nameAr: 'التحقق بالصورة الشخصية',
      description: 'Take a selfie to verify your identity',
      descriptionAr: 'التقط صورة شخصية للتحقق من هويتك',
      icon: Camera,
      status: 'rejected',
      required: true,
      rejectionReason: 'Image quality too low. Please retake in good lighting.'
    }
  ]);

  const [uploadProgress, setUploadProgress] = useState(0);

  const completedCount = verifications.filter(v => v.status === 'approved').length;
  const completionPercentage = (completedCount / verifications.length) * 100;

  const uploadIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (uploadIntervalRef.current) {
        window.clearInterval(uploadIntervalRef.current);
        uploadIntervalRef.current = null;
      }
    };
  }, []);

  const handleVerify = (id: string) => {
    const verification = verifications.find(v => v.id === id);
    
    if (!verification) return;

    if (id === 'phone' || id === 'email') {
      // Simulate instant verification for phone/email
      toast.success(`${verification.name} verification sent!`);
    } else {
      // Simulate file upload then real backend call
      setUploadProgress(0);
      uploadIntervalRef.current = window.setInterval(async () => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            if (uploadIntervalRef.current) {
              window.clearInterval(uploadIntervalRef.current);
              uploadIntervalRef.current = null;
            }

            // Call backend to submit verification
            // In a real app, we'd get the URL from supabase storage first
            const mockUrl = `https://storage.supabase.co/${id}-${Date.now()}.jpg`;

            const headers: Record<string, string> = {
              'Content-Type': 'application/json'
            };

            if (typeof window !== 'undefined') {
              const token = localStorage.getItem('supabase.auth.token');
              if (token) headers['Authorization'] = `Bearer ${token}`;
            }

            fetch('/make-server-0b1f4071/verification/submit', {
              method: 'POST',
              headers,
              body: JSON.stringify({
                document_url: mockUrl,
                document_type: id
              })
            }).then(res => {
               if(res.ok) {
                  setVerifications(prev => prev.map(v => 
                    v.id === id ? { ...v, status: 'pending' } : v
                  ));
                  setUploadProgress(100);
                  toast.success('Document uploaded! Verification in progress.');
               } else {
                  toast.error('Verification submission failed');
                  setUploadProgress(0);
               }
            }).catch(() => {
              toast.error('Verification submission failed');
              setUploadProgress(0);
            });

            return 90;
          }
          return prev + 10;
        });
      }, 200);
    }
  };

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600 text-white gap-1"><CheckCircle className="size-3" /> Verified</Badge>;
      case 'pending':
        return <Badge variant="outline" className="gap-1"><Clock className="size-3" /> Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="size-3" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  const getStatusColor = (status: VerificationStatus) => {
    switch (status) {
      case 'approved':
        return 'text-green-600';
      case 'pending':
        return 'text-amber-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="size-8 text-primary" />
        <div>
          <h1>Verification Center</h1>
          <p className="text-muted-foreground">Complete your profile verification to unlock all features</p>
          <p className="text-muted-foreground text-sm" dir="rtl">أكمل التحقق من ملفك الشخصي لفتح جميع الميزات</p>
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3>Verification Progress</h3>
            <p className="text-sm text-muted-foreground">{completedCount} of {verifications.length} completed</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold text-primary">{Math.round(completionPercentage)}%</div>
            <p className="text-sm text-muted-foreground">Complete</p>
          </div>
        </div>
        <Progress value={completionPercentage} className="h-3" />
      </Card>

      {/* Benefits */}
      <Card className="p-6 bg-primary/5 border-primary">
        <h3 className="mb-3">Why Verify Your Account?</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="flex items-start gap-2">
            <CheckCircle className="size-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Build Trust</p>
              <p className="text-sm text-muted-foreground">Verified profiles get 3x more bookings</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="size-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Higher Rankings</p>
              <p className="text-sm text-muted-foreground">Appear first in search results</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="size-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Unlock Features</p>
              <p className="text-sm text-muted-foreground">Access premium features and offers</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="size-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Safety Badge</p>
              <p className="text-sm text-muted-foreground">Display verified badge on your profile</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Verification Items */}
      <div className="space-y-4">
        {verifications.map(verification => {
          const Icon = verification.icon;
          const statusColor = getStatusColor(verification.status);

          return (
            <Card key={verification.id} className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Icon */}
                <div className={`size-14 rounded-full bg-muted flex items-center justify-center flex-shrink-0 ${statusColor}`}>
                  <Icon className="size-7" />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3>{verification.name}</h3>
                      {verification.required && (
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      )}
                      {getStatusBadge(verification.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{verification.description}</p>
                    <p className="text-sm text-muted-foreground" dir="rtl">{verification.descriptionAr}</p>
                  </div>

                  {/* Rejection Reason */}
                  {verification.status === 'rejected' && verification.rejectionReason && (
                    <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <AlertCircle className="size-5 text-destructive mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-destructive">Verification Rejected</p>
                        <p className="text-sm text-muted-foreground">{verification.rejectionReason}</p>
                      </div>
                    </div>
                  )}

                  {/* Upload Progress */}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    {verification.status === 'not_started' && (
                      <Button onClick={() => handleVerify(verification.id)}>
                        <Upload className="size-4 mr-2" />
                        Start Verification
                      </Button>
                    )}
                    {verification.status === 'rejected' && (
                      <Button onClick={() => handleVerify(verification.id)}>
                        <Upload className="size-4 mr-2" />
                        Retry Verification
                      </Button>
                    )}
                    {verification.status === 'pending' && (
                      <Button variant="outline" disabled>
                        <Clock className="size-4 mr-2" />
                        Under Review (1-2 days)
                      </Button>
                    )}
                    {verification.status === 'approved' && (
                      <Button variant="outline" disabled>
                        <CheckCircle className="size-4 mr-2" />
                        Verified
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Security Notice */}
      <Card className="p-6 bg-muted/50">
        <div className="flex items-start gap-3">
          <Shield className="size-6 text-primary flex-shrink-0 mt-1" />
          <div>
            <h4>Your Privacy & Security</h4>
            <p className="text-sm text-muted-foreground mt-1">
              All documents are encrypted and stored securely. We never share your personal information with other users. 
              Verification is done by our trusted team and automated systems following strict privacy guidelines.
            </p>
            <p className="text-sm text-muted-foreground mt-2" dir="rtl">
              جميع المستندات مشفرة ومخزنة بشكل آمن. نحن لا نشارك معلوماتك الشخصية مع المستخدمين الآخرين أبدًا.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
