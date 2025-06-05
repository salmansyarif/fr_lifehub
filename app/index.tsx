import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import tw from 'twrnc'
import { router, useNavigation, useRouter } from 'expo-router';

export default function Home() {
    const router = useRouter();
  return (
    <View style={tw`flex-1 bg-gray-900 items-center justify-center`}>
    <View> 
      <Image 
        source={require('../assets/images/poto.png')}
        style={tw`w-78 h-78 rounded-full mt--59`}
      />
      </View>
     
      <Text style={tw`text-amber-400 text-xl mt-4 text-center px-4 mt--10 mb-8`}>
        Selamat datang di aplikasi Aktivitas! Mari kita mulai Aktivitas yang luar biasa ini.
      </Text>
      
      <TouchableOpacity style={tw`bg-amber-500 px-12 py-4 rounded-full mt-6`}
      onPress={() => router.push('/Home')}>
    
        <Text style={tw`text-black font-bold  text-xl`}>Mulai</Text>
      </TouchableOpacity>
    </View>
  )
}