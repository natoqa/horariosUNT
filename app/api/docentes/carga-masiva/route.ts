import { NextRequest, NextResponse } from 'next/server';
import { cargaMasivaDocentesAction } from '@/modules/docentes/presentation/actions/carga-masiva.action';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const result = await cargaMasivaDocentesAction(formData);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error en carga masiva:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
