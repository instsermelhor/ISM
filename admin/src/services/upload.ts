/**
 * uploadImage
 * ─────────────
 * Tenta fazer upload de um arquivo de imagem para o Firebase Storage.
 * Em caso de falha (bucket não configurado, regras bloqueadas, etc.),
 * converte a imagem para Base64 (Data URL) como fallback seguro.
 */

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

/**
 * Converte File para Data URL (Base64) — fallback offline/sem Storage
 */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Faz upload da imagem. Retorna a URL pública do Firebase Storage
 * ou, em caso de falha, a Data URL Base64 do arquivo local.
 *
 * @param file   Arquivo de imagem selecionado pelo usuário
 * @param folder Pasta no Storage (padrão: "images")
 * @returns URL da imagem (pública ou Base64)
 */
export async function uploadImage(file: File, folder = 'images'): Promise<string> {
  try {
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (err) {
    console.warn('[uploadImage] Firebase Storage falhou, usando Base64 como fallback:', err);
    return fileToDataUrl(file);
  }
}
