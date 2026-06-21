import { NextRequest, NextResponse } from 'next/server';
import { descargarPlantillaCursosAction } from '@/modules/planes-estudio/presentation/actions/descargar-plantilla.action';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const formato = (searchParams.get('formato') as 'excel' | 'csv') || 'excel';
  
  const result = await descargarPlantillaCursosAction(formato);
  
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  
  if (!result.buffer) {
    return NextResponse.json({ error: 'No se generó el buffer del archivo' }, { status: 500 });
  }

  return new NextResponse(new Uint8Array(result.buffer), {
    headers: {
      'Content-Type': result.mimeType,
      'Content-Disposition': `attachment; filename="${result.filename}"`,
    },
  });
}
