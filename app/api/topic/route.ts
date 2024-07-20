import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
interface TopicRequest {
    userId: string;
    avatar: string;
    content: string;
    images: string[];
    options: string[];
}

const prisma = new PrismaClient();

export async function GET() {
    try {
        const topics = await prisma.topic.findMany({
            include: {
                options: true
            }
        });

        // 解析 JSON 字符串到数组
        const parsedTopics = topics.map(topic => ({
            ...topic,
            images: topic.images as string[] // images 应该是 JSON 字符串，不需要再解析
        }));
        
        return NextResponse.json({
            topics: parsedTopics
        }, {status: 200});
    } catch(e) {
        console.error("🚀 ~ file: route.ts:18 ~ GET ~ e:", e);
        return NextResponse.json({
            message: "Internal Error"
        }, {status: 500});
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = (await request.json()) as TopicRequest;

        const topic = await prisma.topic.create({
            data: {
                userId: data.userId,
                avatar: data.avatar,
                content: data.content,
                images: data.images, // Prisma 自动处理 JSON 类型
                options: {
                    create: data.options.map(item => ({
                        key: item,
                        value: 0
                    }))
                }
            },
            include: {
                options: true
            }
        });

        return NextResponse.json(topic, {status: 200});
    } catch (e) {
        console.error("🚀 ~ file: route.ts:16 ~ POST ~ e:", e);
        return NextResponse.json({
            message: "Internal error",
        }, { status: 500 });
    }
}
