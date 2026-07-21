// app/api/liveness/detect/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PythonService } from '@/services/python.service';

const pythonService = new PythonService();

export async function POST(request: NextRequest) {
  const { data: session } = await auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await pythonService.detectFaces(
      buffer,
      file.name || 'frame.jpg',
      file.type || 'image/jpeg'
    );

    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    console.error('Liveness frame detection API error:', error);
    return NextResponse.json({ error: error.message || 'Frame processing failed' }, { status: 500 });
  }
}
