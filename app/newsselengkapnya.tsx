import { View, Text, Image, ScrollView, TouchableOpacity, Linking } from 'react-native';
import React from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import tw from 'twrnc';
import { Feather } from '@expo/vector-icons';

export default function newsselengkapnya() {
  const route = useRoute();
  const navigation = useNavigation();
  const { article }: any = route.params;

  return (
    <ScrollView style={tw`flex-1 bg-gray-900`}>
      {/* Gambar Utama */}
      {article.urlToImage && (
        <Image
          source={{ uri: article.urlToImage }}
          style={tw`w-full h-64`}
          resizeMode="cover"
        />
      )}

      {/* Konten Artikel */}  
      <View style={tw`p-5`}>
        {/* Judul */}
        <Text style={tw`text-3xl font-bold text-amber-500 mb-4`}>
          {article.title}
        </Text>

        {/* Info Penulis dan Publish */}
        <Text style={tw`text-sm text-amber-400 mb-1`}>
          Penulis: {article.author || 'Tidak diketahui'}
        </Text>
        <Text style={tw`text-sm text-amber-400 mb-1`}>
          Sumber: {article.source?.name || 'Tidak diketahui'}
        </Text>
        <Text style={tw`text-sm text-amber-400 mb-4`}>
          Dipublikasikan: {new Date(article.publishedAt).toLocaleString()}
        </Text>

        {/* Deskripsi / Konten */}
        <Text style={tw`text-base text-white leading-6 mb-6`}>
          {article.content || article.description || 'Konten tidak tersedia.'}
        </Text>

        {/* Tombol Baca Selengkapnya */}
        <TouchableOpacity
          onPress={() => Linking.openURL(article.url)}
          style={tw`bg-amber-500 p-3 rounded-lg flex-row justify-center items-center mb-3`}
        >
          <Feather name="external-link" size={20} color="#fff" />
          <Text style={tw`ml-2 text-white text-base font-bold`}>Baca selengkapnya di sumber asli</Text>
        </TouchableOpacity>

        {/* Tombol Kembali */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={tw`bg-gray-700 p-3 rounded-lg flex-row justify-center items-center`}
        >
          <Feather name="arrow-left" size={20} color="#fff" />
          <Text style={tw`ml-2 text-white text-base font-bold`}>Kembali Ke Halaman Sebelumnya</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}