import { NextRequest, NextResponse } from 'next/server';
import { descargarPlantillaDocentesAction } from '@/modules/docentes/presentation/actions/descargar-plantilla.action';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const formato = (searchParams.get('formato') as 'excel' | 'csv') || 'excel';
  
  const result = await descargarPlantillaDocentesAction(formato);
  
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  
  return new NextResponse(result.buffer, {
    headers: {
      'Content-Type': result.mimeType,
      'Content-Disposition': `attachment; filename="${result.filename}"`,
    },
  });
}
