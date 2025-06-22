/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import type React from 'react';

import { AnimatedInput } from '@/components/ui/AnimatedInput';
import { FloatingParticles } from '@/components/ui/floating-particles';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { GlassCard } from '@/components/ui/glass-card';
import { reportSchema, type ReportFormData } from '@/lib/validations';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { submitReport } from '@/app/actions/reports';
import { SuccessScreen } from '@/components/success-screen';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Calendar,
  Camera,
  CheckCircle,
  FileText,
  Mail,
  MapPin,
  MessageCircle,
  Palette,
  Phone,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ProgressIndicator } from './progress-indicator';

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

const formSections = [
  { id: 'type', title: 'Report Type', icon: Phone },
  { id: 'details', title: 'Phone Details', icon: Palette },
  { id: 'location', title: 'Location & Date', icon: MapPin },
  { id: 'description', title: 'Description', icon: FileText },
  { id: 'contact', title: 'Contact Info', icon: Mail },
  { id: 'image', title: 'Photo', icon: Camera },
];

export function ReportForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<number>>(
    new Set()
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [showProgress, setShowProgress] = useState(false);
  const [progressStage, setProgressStage] = useState<
    'uploading' | 'processing' | 'matching' | 'complete'
  >('uploading');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    matches: number;
    type: 'lost' | 'found';
  } | null>(null);
  const router = useRouter();

  const {
    register,

    setValue,
    watch,
    reset,
    formState: { errors },
    trigger,
    setError,
    clearErrors,
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      type: 'lost',
      dateLostFound: new Date(),
    },
  });

  const watchType = watch('type');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Show upload progress simulation
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setUploadProgress(0);
  };

  const validateSection = async (sectionIndex: number) => {
    let fieldsToValidate: (keyof ReportFormData)[] = [];

    switch (sectionIndex) {
      case 0: // type
        fieldsToValidate = ['type'];
        break;
      case 1: // details
        fieldsToValidate = ['brand', 'color'];
        break;
      case 2: // location
        fieldsToValidate = ['location', 'dateLostFound'];
        break;
      case 3: // description
        fieldsToValidate = ['description'];
        break;
      case 4: // contact (optional but validate if filled)
        const contactEmail = watch('contactEmail');
        const contactPhone = watch('contactPhone');
        if (contactEmail) fieldsToValidate.push('contactEmail');
        if (contactPhone) fieldsToValidate.push('contactPhone');
        break;
      case 5: // image (optional)
        return true;
    }

    if (fieldsToValidate.length === 0) return true;

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCompletedSections((prev) => new Set([...prev, sectionIndex]));
    }
    return isValid;
  };

  const nextSection = async () => {
    const isValid = await validateSection(currentSection);
    if (isValid && currentSection < formSections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSubmitButtonClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setFieldErrors({});

    // Validate all sections
    const allValid = await Promise.all([
      validateSection(0), // type
      validateSection(1), // details
      validateSection(2), // location
      validateSection(3), // description
      validateSection(4), // contact (optional)
    ]);

    if (allValid.every(Boolean)) {
      setIsSubmitting(true);
      setShowProgress(true);
      setProgressStage('uploading');

      try {
        const formData = new FormData();
        const data = watch();

        // Simulate upload progress
        if (selectedImage) {
          setProgressStage('uploading');
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        setProgressStage('processing');
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Append all form fields, handling empty strings properly
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (key === 'dateLostFound') {
              formData.append(key, (value as Date).toISOString());
            } else if (typeof value === 'string' && value.trim() !== '') {
              formData.append(key, value.trim());
            } else if (typeof value !== 'string') {
              formData.append(key, value as string);
            }
          }
        });

        // Append image if selected
        if (selectedImage) {
          formData.append('image', selectedImage);
        }

        setProgressStage('matching');
        await new Promise((resolve) => setTimeout(resolve, 1200));

        const result = await submitReport(formData);

        setProgressStage('complete');
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (result.success) {
          // Show initial success toast
          toast.success(
            watchType === 'lost'
              ? "✅ Your report is live! We'll notify you if we find a match."
              : "❤️ Thank you for helping! We'll let the owner know.",
            { duration: 4000 }
          );

          // Show match notification if matches found
          if (result.matches && result.matches > 0) {
            setTimeout(() => {
              toast.success(
                `🎯 Great news! We've found ${result.matches} possible match${
                  result.matches > 1 ? 'es' : ''
                }. Review ${result.matches > 1 ? 'them' : 'it'} now.`,
                {
                  duration: 6000,
                }
              );
            }, 1000);
          }

          // Set submission result for success screen
          setSubmissionResult({
            matches: result.matches || 0,
            type: watchType,
          });

          // Reset form
          reset();
          setSelectedImage(null);
          setImagePreview(null);
          setCurrentSection(0);
          setCompletedSections(new Set());
          setShowProgress(false);
          setShowSuccess(true);
        } else {
          setShowProgress(false);

          // Handle validation errors
          if (result.fieldErrors) {
            setFieldErrors(result.fieldErrors);
            // Set form errors for individual fields
            Object.entries(result.fieldErrors).forEach(([field, errors]) => {
              if (errors && errors.length > 0) {
                setError(field as keyof ReportFormData, {
                  type: 'manual',
                  message: errors[0],
                });
              }
            });

            // Go back to the section with errors
            if (
              result.fieldErrors.contactPhone ||
              result.fieldErrors.contactEmail
            ) {
              setCurrentSection(4); // Contact section
            } else if (result.fieldErrors.description) {
              setCurrentSection(3); // Description section
            } else if (
              result.fieldErrors.location ||
              result.fieldErrors.dateLostFound
            ) {
              setCurrentSection(2); // Location section
            } else if (result.fieldErrors.brand || result.fieldErrors.color) {
              setCurrentSection(1); // Details section
            } else if (result.fieldErrors.type) {
              setCurrentSection(0); // Type section
            }
          }

          setSubmitError(result.error || 'Failed to submit report');
          toast.error(result.error || 'Failed to submit report');
        }
      } catch (error) {
        console.error('💥 Submission error:', error);
        setShowProgress(false);
        setSubmitError('An unexpected error occurred. Please try again.');
        toast.error('An unexpected error occurred. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      toast.error('Please fill in all required fields correctly');
    }
  };

  const handleSuccessContinue = () => {
    setShowSuccess(false);
    router.push('/dashboard');
  };

  const renderSectionContent = () => {
    switch (currentSection) {
      case 0: // Report Type
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Phone className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">
                What happened to the phone?
              </h3>
              <p className="text-muted-foreground">
                Let us know if you lost or found a device
              </p>
            </div>

            <RadioGroup
              value={watchType}
              onValueChange={(value) => {
                setValue('type', value as 'lost' | 'found');
                clearErrors('type');
              }}
              className="grid grid-cols-2 gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Label
                  htmlFor="lost"
                  className={`flex flex-col items-center p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    watchType === 'lost'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-muted hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value="lost" id="lost" className="sr-only" />
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-3">
                    <Phone className="w-6 h-6 text-red-600" />
                  </div>
                  <span className="font-semibold">I Lost My Phone</span>
                  <span className="text-sm text-muted-foreground mt-1">
                    Report a missing device
                  </span>
                </Label>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Label
                  htmlFor="found"
                  className={`flex flex-col items-center p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    watchType === 'found'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-muted hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem
                    value="found"
                    id="found"
                    className="sr-only"
                  />
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-3">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="font-semibold">I Found a Phone</span>
                  <span className="text-sm text-muted-foreground mt-1">
                    Help return a device
                  </span>
                </Label>
              </motion.div>
            </RadioGroup>

            {errors.type && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.type.message}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </motion.div>
        );

      case 1: // Phone Details
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Palette className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">Phone Details</h3>
              <p className="text-muted-foreground">
                Help us identify the device
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Brand *
                </Label>
                <Select
                  onValueChange={(value) => {
                    setValue('brand', value);
                    clearErrors('brand');
                  }}
                >
                  <SelectTrigger
                    className={`glass h-12 ${
                      errors.brand ? 'border-destructive' : ''
                    }`}
                  >
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent className="glass-card">
                    {PHONE_BRANDS.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.brand && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-destructive"
                  >
                    {errors.brand.message}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Phone Color *
                </Label>
                <Select
                  onValueChange={(value) => {
                    setValue('color', value);
                    clearErrors('color');
                  }}
                >
                  <SelectTrigger
                    className={`glass h-12 ${
                      errors.color ? 'border-destructive' : ''
                    }`}
                  >
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent className="glass-card">
                    {PHONE_COLORS.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.color && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-destructive"
                  >
                    {errors.color.message}
                  </motion.p>
                )}
              </div>
            </div>
          </motion.div>
        );

      case 2: // Location & Date
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">Location & Date</h3>
              <p className="text-muted-foreground">
                Where and when did this happen?
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-base font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location *
                </Label>
                <AnimatedInput
                  placeholder="Where was the phone lost/found? (e.g., Central Park, NYC)"
                  icon={<MapPin className="w-4 h-4" />}
                  className={errors.location ? 'border-destructive' : ''}
                  {...register('location')}
                />
                {errors.location && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-destructive"
                  >
                    {errors.location.message}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date {watchType === 'lost' ? 'Lost' : 'Found'} *
                </Label>
                <AnimatedInput
                  type="date"
                  icon={<Calendar className="w-4 h-4" />}
                  className={errors.dateLostFound ? 'border-destructive' : ''}
                  {...register('dateLostFound', { valueAsDate: true })}
                />
                {errors.dateLostFound && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-destructive"
                  >
                    {errors.dateLostFound.message}
                  </motion.p>
                )}
              </div>
            </div>
          </motion.div>
        );

      case 3: // Description
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <FileText className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">Description</h3>
              <p className="text-muted-foreground">
                Provide additional details to help with matching
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Additional Details *
              </Label>
              <Textarea
                placeholder="Provide additional details about the phone (model, case, distinctive features, etc.)"
                rows={6}
                className={`glass resize-none ${
                  errors.description ? 'border-destructive' : ''
                }`}
                {...register('description')}
              />
              {errors.description && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-destructive"
                >
                  {errors.description.message}
                </motion.p>
              )}
            </div>
          </motion.div>
        );

      case 4: // Contact Information
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Mail className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">Contact Information</h3>
              <p className="text-muted-foreground">
                Optional - How can people reach you?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email (Optional)
                </Label>
                <AnimatedInput
                  type="email"
                  placeholder="your@email.com"
                  icon={<Mail className="w-4 h-4" />}
                  className={errors.contactEmail ? 'border-destructive' : ''}
                  {...register('contactEmail')}
                />
                {errors.contactEmail && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-destructive"
                  >
                    {errors.contactEmail.message}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-base font-medium flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Phone Number (Optional)
                </Label>
                <AnimatedInput
                  type="tel"
                  placeholder="+91 9876543210"
                  icon={<MessageCircle className="w-4 h-4" />}
                  className={errors.contactPhone ? 'border-destructive' : ''}
                  {...register('contactPhone')}
                />
                {errors.contactPhone && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-destructive"
                  >
                    {errors.contactPhone.message}
                  </motion.p>
                )}
                <p className="text-xs text-muted-foreground">
                  Format: +91 9876543210, 123-456-7890, or (123) 456-7890
                </p>
              </div>
            </div>
          </motion.div>
        );

      case 5: // Image Upload
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Camera className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">Add a Photo</h3>
              <p className="text-muted-foreground">
                Optional - A picture helps with identification
              </p>
            </div>

            <div className="space-y-4">
              <div className="glass-card p-8 border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors relative">
                {imagePreview ? (
                  <div className="relative">
                    <motion.img
                      src={imagePreview || '/placeholder.svg'}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded-lg"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    <motion.button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-4 h-4" />
                    </motion.button>

                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="bg-black/50 rounded-full p-2">
                          <div className="w-full bg-gray-300 rounded-full h-1">
                            <motion.div
                              className="bg-primary h-1 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${uploadProgress}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                          <p className="text-white text-xs text-center mt-1">
                            Uploading... {uploadProgress}%
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <div className="space-y-2">
                      <p className="text-lg font-medium">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-muted-foreground">
                        PNG, JPG up to 5MB
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
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-gray-900 dark:via-orange-900 dark:to-red-900" />

        {/* Floating Particles */}
        <FloatingParticles count={25} />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                {formSections.map((section, index) => (
                  <motion.div
                    key={section.id}
                    className="flex items-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        index === currentSection
                          ? 'bg-primary text-primary-foreground glow-primary'
                          : completedSections.has(index)
                          ? 'bg-green-500 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {completedSections.has(index) ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <section.icon className="w-5 h-5" />
                      )}
                    </div>
                    {index < formSections.length - 1 && (
                      <div
                        className={`w-12 h-0.5 mx-2 transition-colors ${
                          completedSections.has(index)
                            ? 'bg-green-500'
                            : 'bg-muted'
                        }`}
                      />
                    )}
                  </motion.div>
                ))}
              </div>
              <div className="text-center">
                <h2 className="text-sm font-medium text-muted-foreground">
                  Step {currentSection + 1} of {formSections.length}
                </h2>
              </div>
            </div>

            <GlassCard className="p-8" glow>
              {/* Error Alert */}
              {submitError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{submitError}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                {renderSectionContent()}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
                <FuturisticButton
                  type="button"
                  variant="ghost"
                  onClick={prevSection}
                  disabled={currentSection === 0}
                  className={currentSection === 0 ? 'invisible' : ''}
                >
                  Previous
                </FuturisticButton>

                {currentSection === formSections.length - 1 ? (
                  <FuturisticButton
                    type="button"
                    variant="glow"
                    disabled={isSubmitting}
                    className="group"
                    onClick={handleSubmitButtonClick}
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Submitting Report...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                        Submit Report
                      </>
                    )}
                  </FuturisticButton>
                ) : (
                  <FuturisticButton
                    type="button"
                    variant="glow"
                    onClick={nextSection}
                  >
                    Next
                  </FuturisticButton>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>

      {/* Progress Indicator */}
      {showProgress && (
        <ProgressIndicator stage={progressStage} progress={uploadProgress} />
      )}

      {/* Success Screen */}
      {showSuccess && submissionResult && (
        <SuccessScreen
          type={submissionResult.type}
          matchCount={submissionResult.matches}
          onContinue={handleSuccessContinue}
        />
      )}
    </>
  );
}
