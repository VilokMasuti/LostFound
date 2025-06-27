/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { submitReport } from '@/app/actions/reports';
import { ErrorDialog } from '@/components/error-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { reportSchema, type ReportFormData } from '@/lib/validations';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  Calendar,
  Camera,
  CheckCircle,
  FileWarning,
  Heart,
  Loader2,
  Mail,
  MapPin,
  Phone,
  PhoneCall,
  Search,
  Send,
  Shield,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const PHONE_BRANDS = [
  'Apple',
  'Samsung',
  'Google',
  'OnePlus',
  'Xiaomi',
  'Huawei',
  'Sony',
  'LG',
  'Motorola',
  'Nokia',
  'Other',
];

const PHONE_COLORS = [
  'Black',
  'White',
  'Silver',
  'Gold',
  'Rose Gold',
  'Blue',
  'Red',
  'Green',
  'Purple',
  'Pink',
  'Gray',
  'Other',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

interface ModernReportFormProps {
  defaultType?: 'lost' | 'found' | null;
  referenceId?: string | null;
}

export function ModernReportForm({
  defaultType,
  referenceId,
}: ModernReportFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [referencedReport, setReferencedReport] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },

    clearErrors,
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      type: defaultType || 'lost',
      dateLostFound: new Date(),
      priority: 'medium',
    },
    mode: 'onChange',
  });

  const watchType = watch('type');
  const watchBrand = watch('brand');
  const watchColor = watch('color');
  const watchLocation = watch('location');
  const watchDescription = watch('description');

  useEffect(() => {
    if (referenceId) {
      fetchReferencedReport(referenceId);
    }
  }, [referenceId]);

  const fetchReferencedReport = async (id: string) => {
    try {
      const response = await fetch(`/api/reports/${id}`);
      if (response.ok) {
        const data = await response.json();
        setReferencedReport(data);

        setValue('brand', data.brand);
        setValue('color', data.color);
        if (data.model) setValue('model', data.model);
        setValue('location', data.location);
        setValue('type', 'found');
      }
    } catch (error) {
      console.error('Failed to fetch referenced report:', error);
      toast.error('Failed to load referenced report');
    }
  };

  const validateFile = (file: File): string[] => {
    const errors: string[] = [];

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      errors.push(
        `File size (${(file.size / 1024 / 1024).toFixed(
          1
        )}MB) exceeds the 5MB limit`
      );
    }

    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      errors.push(
        `File type "${file.type}" is not supported. Please use JPG, PNG, or WebP`
      );
    }

    // Check file name length
    if (file.name.length > 100) {
      errors.push('File name is too long (max 100 characters)');
    }

    return errors;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);

    if (!file) return;

    // Validate file
    const fileErrors = validateFile(file);
    if (fileErrors.length > 0) {
      setValidationErrors(fileErrors);
      setShowErrorDialog(true);
      e.target.value = ''; // Clear the input
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.onerror = () => {
      setFileError('Failed to read the image file');
      toast.error('Failed to read the image file');
    };
    reader.readAsDataURL(file);

    // Simulate upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          toast.success('Image uploaded successfully!', {
            style: {
              background: '#111111',
              color: '#FFFFFF',
              border: '1px solid #333333',
            },
          });
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setUploadProgress(0);
    setFileError(null);
    toast.info('Image removed', {
      style: {
        background: '#111111',
        color: '#FFFFFF',
        border: '1px solid #333333',
      },
    });
  };

  const validateFormData = (data: ReportFormData): string[] => {
    const errors: string[] = [];

    // Custom validation beyond schema
    if (!data.contactEmail && !data.contactPhone) {
      errors.push(
        'Please provide at least one contact method (email or phone)'
      );
    }

    if (
      data.contactEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)
    ) {
      errors.push('Please enter a valid email address');
    }

    if (data.contactPhone && data.contactPhone.length < 10) {
      errors.push('Phone number must be at least 10 digits');
    }

    if (data.description && data.description.length < 20) {
      errors.push('Description must be at least 20 characters long');
    }

    if (data.location && data.location.length < 5) {
      errors.push('Location must be more specific (at least 5 characters)');
    }

    return errors;
  };

  const onSubmit = async (data: ReportFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setValidationErrors([]);

    try {
      // Additional validation
      const customErrors = validateFormData(data);
      if (customErrors.length > 0) {
        setValidationErrors(customErrors);
        setShowErrorDialog(true);
        setIsSubmitting(false);
        return;
      }

      toast.loading('Submitting your report...', { id: 'submit-toast' });

      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'dateLostFound') {
            formData.append(key, (value as Date).toISOString());
          } else {
            formData.append(key, String(value));
          }
        }
      });

      if (selectedImage) {
        const fileErrors = validateFile(selectedImage);
        if (fileErrors.length > 0) {
          setValidationErrors(fileErrors);
          setShowErrorDialog(true);
          toast.error(
            'Image validation failed. Please fix the errors and try again.',
            {
              style: {
                background: '#111111',
                color: '#FFFFFF',
                border: '1px solid #333333',
              },
            }
          );
          setIsSubmitting(false);
          return;
        }

        formData.append('image', selectedImage);
      }

      if (referenceId) {
        formData.append('referenceId', referenceId);
      }

      const result = await submitReport(formData);

      toast.dismiss('submit-toast');

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit report');
      }

      // Show success messages
      if (watchType === 'lost') {
        toast.success(
          "✅ Your lost phone report is live! We'll notify you if we find a match.",
          {
            style: {
              background: '#111111',
              color: '#FFFFFF',
              border: '1px solid #333333',
            },
          }
        );
      } else {
        if (referencedReport) {
          toast.success(
            '❤️ Found phone report submitted! The owner has been notified and will contact you.',
            {
              style: {
                background: '#111111',
                color: '#FFFFFF',
                border: '1px solid #333333',
              },
            }
          );
        } else {
          toast.success(
            "❤️ Thanks for reporting! We'll contact the owner if we find a match.",
            {
              style: {
                background: '#111111',
                color: '#FFFFFF',
                border: '1px solid #333333',
              },
            }
          );
        }
      }

      if (result.matches && result.matches > 0) {
        setTimeout(() => {
          toast.success(
            `🎯 Found ${result.matches} possible match${
              result.matches > 1 ? 'es' : ''
            }!`,
            {
              style: {
                background: '#111111',
                color: '#FFFFFF',
                border: '1px solid #333333',
              },
            }
          );
        }, 1500);
      }

      // Reset form
      reset();
      setSelectedImage(null);
      setImagePreview(null);
      setUploadProgress(0);
      setFileError(null);

      // Redirect based on type
      if (watchType === 'lost') {
        router.push('/dashboard?tab=lost');
      } else {
        router.push('/dashboard?tab=found');
      }
    } catch (error) {
      toast.dismiss('submit-toast');
      console.error('Submission error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unexpected error occurred';
      setSubmitError(errorMessage);
      setValidationErrors([errorMessage]);
      setShowErrorDialog(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormError = () => {
    const errorMessages: string[] = [];

    Object.entries(errors).forEach(([field, error]) => {
      if (error?.message) {
        errorMessages.push(`${field}: ${error.message}`);
      }
    });

    if (errorMessages.length > 0) {
      setValidationErrors(errorMessages);
      setShowErrorDialog(true);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Error Dialog */}
          <ErrorDialog
            isOpen={showErrorDialog}
            onClose={() => setShowErrorDialog(false)}
            title="Form Validation Errors"
            errors={validationErrors}
            onRetry={() => {
              setShowErrorDialog(false);
              setValidationErrors([]);
              clearErrors();
            }}
          />

          {referencedReport && (
            <Alert className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                <strong>📱 Matching Lost Phone Found!</strong> You&apos;re
                reporting a found phone that matches{' '}
                <strong>
                  {referencedReport.brand} {referencedReport.color}
                </strong>{' '}
                lost near <strong>{referencedReport.location}</strong>. The form
                has been pre-filled with matching details. The owner will be
                notified immediately when you submit.
              </AlertDescription>
            </Alert>
          )}

          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              Help reunite items with their owners
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              {referencedReport ? 'Report Found Phone' : 'Report an Item'}
            </h1>
            <p className="text-muted-foreground">
              {referencedReport
                ? 'Fill out the details of the phone you found. The owner will be notified automatically.'
                : 'Fill out the form below to report a lost or found item. The more details you provide, the better we can match it!'}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Item Report Details
              </CardTitle>
              <CardDescription>
                Provide as much detail as possible to help with matching. All
                fields marked with * are required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit(onSubmit, handleFormError)}
                className="space-y-8"
              >
                {submitError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{submitError}</AlertDescription>
                  </Alert>
                )}

                {!referencedReport && (
                  <>
                    <div className="space-y-4">
                      <Label className="text-base font-medium">
                        What happened to the item? *
                      </Label>
                      <RadioGroup
                        value={watchType}
                        onValueChange={(value) =>
                          setValue('type', value as 'lost' | 'found')
                        }
                        className="grid grid-cols-2 gap-4"
                      >
                        <div>
                          <RadioGroupItem
                            value="lost"
                            id="lost"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="lost"
                            className={cn(
                              'flex flex-col items-center justify-between rounded-lg border-2 bg-popover p-6 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all',
                              watchType === 'lost'
                                ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                                : 'border-muted'
                            )}
                          >
                            <div className="flex items-center space-x-3 mb-3">
                              <div
                                className={cn(
                                  'p-2 rounded-lg',
                                  watchType === 'lost'
                                    ? 'bg-red-200 dark:bg-red-900/40'
                                    : 'bg-red-100 dark:bg-red-900/20'
                                )}
                              >
                                <Search
                                  className={cn(
                                    'h-6 w-6',
                                    watchType === 'lost'
                                      ? 'text-red-600'
                                      : 'text-red-500'
                                  )}
                                />
                              </div>
                              <span className="font-semibold text-lg">
                                I Lost Something
                              </span>
                            </div>
                            <span className="text-sm text-muted-foreground text-center">
                              Report a missing item you&apos;ve lost
                            </span>
                            {watchType === 'lost' && (
                              <Badge className="mt-2 bg-primary text-primary-foreground">
                                Selected
                              </Badge>
                            )}
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem
                            value="found"
                            id="found"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="found"
                            className={cn(
                              'flex flex-col items-center justify-between rounded-lg border-2 bg-popover p-6 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all',
                              watchType === 'found'
                                ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                                : 'border-muted'
                            )}
                          >
                            <div className="flex items-center space-x-3 mb-3">
                              <div
                                className={cn(
                                  'p-2 rounded-lg',
                                  watchType === 'found'
                                    ? 'bg-green-200 dark:bg-green-900/40'
                                    : 'bg-green-100 dark:bg-green-900/20'
                                )}
                              >
                                <Heart
                                  className={cn(
                                    'h-6 w-6',
                                    watchType === 'found'
                                      ? 'text-green-600'
                                      : 'text-green-500'
                                  )}
                                />
                              </div>
                              <span className="font-semibold text-lg">
                                I Found Something
                              </span>
                            </div>
                            <span className="text-sm text-muted-foreground text-center">
                              Help return an item to its owner
                            </span>
                            {watchType === 'found' && (
                              <Badge className="mt-2 text-primary-foreground">
                                Selected
                              </Badge>
                            )}
                          </Label>
                        </div>
                      </RadioGroup>
                      {errors.type && (
                        <p className="text-sm text-destructive">
                          {errors.type.message}
                        </p>
                      )}
                    </div>

                    <Separator />
                  </>
                )}

                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Item Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="brand"
                        className="flex items-center gap-2"
                      >
                        <Phone className="h-4 w-4" />
                        Brand *
                      </Label>
                      <Select
                        onValueChange={(value) => setValue('brand', value)}
                        value={watchBrand}
                      >
                        <SelectTrigger
                          className={errors.brand ? 'border-red-500' : ''}
                        >
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                        <SelectContent className="bg-black shadow-xs">
                          {PHONE_BRANDS.map((brand) => (
                            <SelectItem key={brand} value={brand}>
                              {brand}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.brand && (
                        <p className="text-sm text-destructive">
                          {errors.brand.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="color">Color *</Label>
                      <Select
                        onValueChange={(value) => setValue('color', value)}
                        value={watchColor}
                      >
                        <SelectTrigger
                          className={errors.color ? 'border-red-500' : ''}
                        >
                          <SelectValue placeholder="Select color" />
                        </SelectTrigger>
                        <SelectContent>
                          {PHONE_COLORS.map((color) => (
                            <SelectItem key={color} value={color}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded-full border"
                                  style={{
                                    backgroundColor:
                                      color.toLowerCase() === 'other'
                                        ? '#gray'
                                        : color.toLowerCase(),
                                  }}
                                />
                                {color}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.color && (
                        <p className="text-sm text-destructive">
                          {errors.color.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">Model (Optional)</Label>
                    <Input
                      id="model"
                      placeholder="e.g., iPhone 14 Pro, Galaxy S23 Ultra, Pixel 7"
                      {...register('model')}
                    />
                    <p className="text-xs text-muted-foreground">
                      Include the specific model if known - this helps with
                      matching
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">When & Where</h3>

                  <div className="space-y-2">
                    <Label
                      htmlFor="location"
                      className="flex items-center gap-2"
                    >
                      <MapPin className="h-4 w-4" />
                      Location *
                    </Label>
                    <Input
                      id="location"
                      placeholder="Where was the item lost/found? (e.g., Central Park near the fountain, NYC)"
                      {...register('location')}
                      className={errors.location ? 'border-red-500' : ''}
                    />
                    {errors.location && (
                      <p className="text-sm text-destructive">
                        {errors.location.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Be as specific as possible - include landmarks, street
                      names, or building names
                    </p>
                    {watchLocation && watchLocation.length < 5 && (
                      <p className="text-xs text-yellow-600">
                        ⚠️ Location should be more specific
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="dateLostFound"
                      className="flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      Date {watchType === 'lost' ? 'Lost' : 'Found'} *
                    </Label>
                    <Input
                      id="dateLostFound"
                      type="date"
                      {...register('dateLostFound', { valueAsDate: true })}
                      className={errors.dateLostFound ? 'border-red-500' : ''}
                    />
                    {errors.dateLostFound && (
                      <p className="text-sm text-destructive">
                        {errors.dateLostFound.message}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="description">Additional Details *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the item in detail - include any distinctive features, case type, screen protectors, stickers, damage, etc."
                    rows={4}
                    {...register('description')}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">
                      {errors.description.message}
                    </p>
                  )}
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      The more details you provide, the easier it will be to
                      match with the right owner
                    </span>
                    <span
                      className={
                        watchDescription && watchDescription.length < 20
                          ? 'text-yellow-600'
                          : ''
                      }
                    >
                      {watchDescription?.length || 0} characters (min 20)
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Provide at least one contact method so people can reach
                        you
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="contactEmail"
                        className="flex items-center gap-2"
                      >
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        placeholder="your@email.com"
                        {...register('contactEmail')}
                        className={errors.contactEmail ? 'border-red-500' : ''}
                      />
                      {errors.contactEmail && (
                        <p className="text-sm text-destructive">
                          {errors.contactEmail.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="contactPhone"
                        className="flex items-center gap-2"
                      >
                        <PhoneCall className="h-4 w-4" />
                        Phone Number
                      </Label>
                      <Input
                        id="contactPhone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        {...register('contactPhone')}
                        className={errors.contactPhone ? 'border-red-500' : ''}
                      />
                      {errors.contactPhone && (
                        <p className="text-sm text-destructive">
                          {errors.contactPhone.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Photo (Optional but Recommended)
                  </Label>

                  {fileError && (
                    <Alert variant="destructive">
                      <FileWarning className="h-4 w-4" />
                      <AlertDescription>{fileError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors relative">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview || '/placeholder.svg'}
                          alt="Preview"
                          className="max-h-64 mx-auto rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={removeImage}
                          className="absolute top-2 right-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        {uploadProgress > 0 && uploadProgress < 100 && (
                          <div className="absolute bottom-2 left-2 right-2">
                            <Progress value={uploadProgress} className="h-2" />
                            <p className="text-xs text-center mt-1">
                              Uploading... {uploadProgress}%
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 bg-muted rounded-full w-fit mx-auto">
                          <Upload className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-lg font-medium">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-sm text-muted-foreground">
                            PNG, JPG, WebP up to 5MB
                          </p>
                          <p className="text-xs text-muted-foreground">
                            A clear photo greatly increases the chances of a
                            successful match
                          </p>
                        </div>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  {watchBrand && watchColor && (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm">
                        <strong>Summary:</strong> You&apos;re reporting a{' '}
                        {watchType} {watchBrand} {watchColor} phone
                        {referencedReport &&
                          ' that matches a lost phone report'}
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting || !isValid}
                    className="w-full"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Submitting Report...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        Submit {watchType === 'lost' ? 'Lost' : 'Found'} Report
                        {referencedReport && ' & Notify Owner'}
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By submitting this report, you agree to be contacted by
                    users who may have found/lost your item.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
