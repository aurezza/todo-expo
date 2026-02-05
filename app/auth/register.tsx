import { useAuthActions } from '@/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
        const { success, error } = await useAuthActions.register(name, email, password);
        if (success) {
            Alert.alert('Success', 'Account created successfully!', [
                { text: 'OK', onPress: () => router.replace('/(home)') }
            ]);
        } else {
            Alert.alert('Error', error || 'Registration failed. Please try again.');
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
        <TouchableOpacity 
            onPress={() => router.back()}
            className="absolute top-12 left-6 z-10 p-2 bg-gray-900/50 rounded-full"
        >
            <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <View className="items-center mb-10 mt-10">
            <View className="w-20 h-20 bg-purple-600/20 rounded-3xl items-center justify-center mb-6 transform -rotate-3">
                <Ionicons name="person-add" size={36} color="#a855f7" />
            </View>
          <Text className="text-3xl font-bold text-white mb-2">Create Account</Text>
          <Text className="text-gray-400 text-center">Join us and start organizing your tasks</Text>
        </View>

        <View className="space-y-4 w-full">
          <View>
            <Text className="text-gray-400 mb-2 ml-1">Full Name</Text>
            <View className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex-row items-center">
              <Ionicons name="person-outline" size={20} color="#9ca3af" className="mr-3" />
              <TextInput 
                className="flex-1 text-white text-base"
                placeholder="Enter your name"
                placeholderTextColor="#4b5563"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

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
                placeholder="Create a password"
                placeholderTextColor="#4b5563"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleRegister}
            disabled={isSubmitting}
            className="bg-purple-600 p-5 rounded-2xl items-center mt-6 shadow-lg shadow-purple-900/20 active:bg-purple-700"
          >
             {isSubmitting ? (
                 <ActivityIndicator color="white" />
             ) : (
                <Text className="text-white font-bold text-lg">Sign Up</Text>
             )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-500">Already have an account? </Text>
            <Link href="/auth/login" asChild>
              <TouchableOpacity>
                <Text className="text-purple-500 font-bold">Log In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
