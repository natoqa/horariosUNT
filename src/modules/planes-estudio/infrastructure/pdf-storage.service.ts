import { createClient } from '@/shared/lib/supabase/server';

export class PdfStorageService {
  private readonly BUCKET_NAME = 'planes-estudio';

  async uploadPdf(file: File, planId: string): Promise<string> {
    const supabase = await createClient();
    
    // Verificar si el bucket existe, si no, crearlo
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === this.BUCKET_NAME);
    
    if (!bucketExists) {
      await supabase.storage.createBucket(this.BUCKET_NAME, {
        public: false,
        fileSizeLimit: 10485760, // 10MB
      });
    }

    const fileName = `${planId}/${file.name}`;
    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(fileName, file, {
        upsert: true,
      });

    if (error) {
      throw new Error(`Error al subir PDF: ${error.message}`);
    }

    // Obtener URL pública del archivo
    const { data: { publicUrl } } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(fileName);

    return publicUrl;
  }

  async deletePdf(planId: string): Promise<void> {
    const supabase = await createClient();
    
    // Listar archivos en el directorio del plan
    const { data: files } = await supabase.storage
      .from(this.BUCKET_NAME)
      .list(planId);

    if (files && files.length > 0) {
      // Eliminar todos los archivos del directorio
      const filePaths = files.map(f => `${planId}/${f.name}`);
      await supabase.storage
        .from(this.BUCKET_NAME)
        .remove(filePaths);
    }
  }
}
