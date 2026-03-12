import { env } from '@/env';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY || 'MISSING_KEY',
});

export default openai;
