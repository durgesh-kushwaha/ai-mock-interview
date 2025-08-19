import { Github, Linkedin, Mail, Phone, ArrowLeft, Code } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { Button } from '@/components/ui/button';

function DeveloperPage() {
    
    const devDetails = {
        name: 'Durgesh Kushwaha',
        title: 'Full Stack Developer & AI Enthusiast',
        email: 'durgeshcgc@gmail.com',
        phone: '+91 77068 20906',
        github: 'https://github.com/durgesh-kushwaha',
        linkedin: 'https://linkedin.com/in/durgesh-kushwaha',
        imageUrl: '/durgesh.jpeg', 
        skills: ['Next.js', 'React', 'TypeScript', 'Node.js', 'Drizzle ORM', 'PostgreSQL', 'Tailwind CSS', 'Gemini API']
    };

    return (
        <div className='min-h-[calc(100vh-160px)] bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center p-4'>
            <div className='w-full max-w-2xl mx-auto'>
                <Link href="/dashboard" className='mb-6 inline-block'>
                    <Button variant="outline" className='bg-white/50 backdrop-blur-sm'>
                        <ArrowLeft className='mr-2 h-4 w-4' /> Back to Dashboard
                    </Button>
                </Link>

                <div className='bg-white/60 backdrop-blur-lg shadow-xl rounded-2xl overflow-hidden border border-white'>
                    <div className='p-8'>
                        <div className='flex flex-col sm:flex-row items-center gap-8'>
                            <Image
                                src={devDetails.imageUrl}
                                alt={devDetails.name}
                                width={150}
                                height={150}
                                className='rounded-full border-4 border-white shadow-md'
                            />
                            <div className='text-center sm:text-left'>
                                <h1 className='text-4xl font-bold text-gray-800'>{devDetails.name}</h1>
                                <p className='text-blue-600 font-medium mt-1'>{devDetails.title}</p>
                                
                                {}
                                <div className='flex flex-wrap justify-center sm:justify-start items-center gap-x-6 gap-y-2 mt-4'>
                                    <Link href={devDetails.github} target="_blank" className='flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors'>
                                        <Github size={20} /> GitHub
                                    </Link>
                                    <Link href={devDetails.linkedin} target="_blank" className='flex items-center gap-2 text-gray-600 hover:text-blue-700 transition-colors'>
                                        <Linkedin size={20} /> LinkedIn
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {}
                        <div className='mt-8 pt-6 border-t'>
                             <div className='space-y-4'>
                                <a href={`mailto:${devDetails.email}`} className='flex items-center gap-3 text-gray-700 hover:text-red-600 transition-colors'>
                                    <Mail size={20} />
                                    <span>{devDetails.email}</span>
                                </a>
                                <div className='flex items-center gap-3 text-gray-700'>
                                    <Phone size={20} />
                                    <span>{devDetails.phone}</span>
                                </div>
                            </div>
                        </div>

                        {}
                        <div className='mt-8'>
                            <h2 className='text-xl font-semibold text-gray-700 flex items-center gap-2'>
                                <Code />
                                Skills & Technologies
                            </h2>
                            <div className='flex flex-wrap gap-2 mt-4'>
                                {devDetails.skills.map(skill => (
                                    <span key={skill} className='bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full'>
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DeveloperPage;