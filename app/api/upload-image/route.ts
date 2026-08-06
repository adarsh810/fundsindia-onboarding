import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const BUCKET = 'fi-notes-images';
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get('file');
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 413 });
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only images allowed' }, { status: 415 });
  }

  const ext = file.type.split('/')[1]?.replace('jpeg', 'jpg') ?? 'png';
  const path = `notes/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    console.error('upload-image error', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: publicUrl });
}
