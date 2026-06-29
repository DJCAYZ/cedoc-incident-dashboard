import 'dotenv/config';

import { auth } from '@/lib/auth';
import { cancel, intro, isCancel, outro, password, text } from '@clack/prompts';
import z from 'zod';

async function createUser() {
    intro('create-user');

    const userName = await text({
        message: 'What is the user\'s name?',
        validate: (value) => {
            const result = z
                .string()
                .max(64)
                .safeParse(value);
            
            if (!result.success) {
                return result.error.issues[0].message;
            }
        },
    });

    if (isCancel(userName)) {
        return cancel('User creation cancelled.');
    }

    const userEmail = await text({
        message: 'What is the user\'s email?',
        validate: (value) => {
            const result = z
                .email()
                .safeParse(value);
            
            if (!result.success) {
                return result.error.issues[0].message;
            }
        },
    });

    if (isCancel(userName)) {
        return cancel('User creation cancelled.');
    }
    
    const userPassword = await password({
        message: 'What is the user\'s account password?',
        validate: (value) => {
            const result = z
                .string()
                .min(8)
                .max(64)
                .safeParse(value);
            
            if (!result.success) {
                return result.error.issues[0].message;
            }
        },
    });

    if (isCancel(userName)) {
        return cancel('User creation cancelled.');
    }

    const newUser = auth.api.signUpEmail({
        body: {
            name: userName,
            email: userEmail as string,
            password: userPassword as string,
        },
    });

    outro(`User ${(await newUser).user.name} created`);
}

createUser();