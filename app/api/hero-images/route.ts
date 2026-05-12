import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const HERO_DIR = path.join(process.cwd(), 'public', 'images', 'Login_Signup_Heros');
const VALID_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);

export async function GET() {
    try {
        const files = fs.readdirSync(HERO_DIR);
        const images = files
            .filter(f => VALID_EXTS.has(path.extname(f).toLowerCase()))
            .map(f => `/images/Login_Signup_Heros/${f}`);

        return NextResponse.json({ images });
    } catch {
        return NextResponse.json({ images: [] });
    }
}
