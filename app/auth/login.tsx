import { useAuthActions } from '@/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
        const { success, error } = await useAuthActions.login(email, password);
        if (success) {
            router.replace('/(home)');
        } else {
            Alert.alert('Login Failed', error || 'Invalid email or password.');
        }
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-black"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <View className="items-center mb-12">
          <View className="w-20 h-20 bg-blue-600/20 rounded-3xl items-center justify-center mb-6 transform rotate-3">
            <Ionicons name="checkmark-done" size={40} color="#3b82f6" />
          </View>
          <Text className="text-4xl font-bold text-white mb-2">Welcome Back</Text>
          <Text className="text-gray-400 text-lg">Sign in to continue</Text>
        </View>

        <View className="space-y-4 w-full">
          <View>
            <Text className="text-gray-400 mb-2 ml-1">Email</Text>
            <View className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex-row items-center">
              <Ionicons name="mail-outline" size={20} color="#9ca3af" className="mr-3" />
              <TextInput 
                className="flex-1 text-white text-base"
                placeholder="Enter your email"
                placeholderTextColor="#4b5563"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View>
            <Text className="text-gray-400 mb-2 ml-1">Password</Text>
            <View className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex-row items-center">
              <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" className="mr-3" />
              <TextInput 
                className="flex-1 text-white text-base"
                placeholder="Enter your password"
                placeholderTextColor="#4b5563"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleLogin}
            disabled={isSubmitting}
            className="bg-blue-600 p-5 rounded-2xl items-center mt-6 shadow-lg shadow-blue-900/20 active:bg-blue-700"
          >
            {isSubmitting ? (
                <ActivityIndicator color="white" />
            ) : (
                <Text className="text-white font-bold text-lg">Log In</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-500">Don't have an account? </Text>
            <Link href="/auth/register" asChild>
              <TouchableOpacity>
                <Text className="text-blue-500 font-bold">Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
