/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Silk from '@/components/ui/Silk';
import { useAuth } from '@/context/AuthContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
    } catch (error) {
      // Error handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2">
      {/* Left Side - Image Section (UNCHANGED) */}
      <div className="hidden lg:block relative w-full h-screen">
        <Silk
          speed={5}
          scale={1}
          color="#7B7481"
          noiseIntensity={1.5}
          rotation={0}
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center px-10">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-4 font-serif opacity-10 tracking-widest">
              Welcome Back
            </h2>
            <p className="text-lg font-light opacity-15 mb-6">
              Secure login, Lost will find its way back home.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form with Background Logo + Glass Card */}
      <div className="flex items-center justify-center p-8 relative  lg:rounded-l-none rounded-lg overflow-hidden">
        {/* Logo background behind form */}
        <Image
          src="/bglogo.png"
          alt="Reconnect Logo"
          width={1000}
          height={1000}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        />

        {/* Glass effect login card */}
        <div className="w-full max-w-md bg-white/30 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-lg relative z-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-black rounded-2xl mb-4">
              <div className="w-5 h-5 bg-white rounded-md"></div>
            </div>
            <h1 className="text-3xl font-semibold text-gray-800 mb-1">
              Sign In
            </h1>
            <p className="text-gray-500 text-sm">
              Welcome back to your account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="h-11 bg-white/70 border border-gray-300 text-black rounded-xl"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="h-11 pr-10 bg-white/70 text-black border border-gray-300 rounded-xl"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-black hover:bg-gray-800 text-white rounded-xl"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>

            {/* Sign Up */}
            <p className="text-center text-gray-700 text-sm">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="text-black font-medium hover:underline"
              >
                Create one
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Index;
