import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server"
import { clerkClient } from "@clerk/nextjs/server";
interface RecordRequest {
    userId: string;
    topicId: number;
    choice?: string;
}

const prisma = new PrismaClient();
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const topicId = searchParams.get("topicId");

    // 确保 userId 和 topicId 都被获取
    if (!userId || !topicId) {
        return NextResponse.json({
            message: "Invalid parameters"
        }, { status: 400 });
    }
    const user = await clerkClient.users.getUser(userId)
    console.log(2134324)
    //@ts-ignore
    console.log(user.firstName+user.lastName)

    // 确保转换为正确的类型
    const numericTopicId = Number(topicId);

    // 检查转换后的值是否有效
    if (isNaN(numericTopicId)) {
        return NextResponse.json({
            message: "Invalid parameters"
        }, { status: 400 });
    }

    const record = await prisma.record.findFirst({
        where: {
            userId: userId,
            topicId: numericTopicId
        }
    });

    if (!record) {
        return NextResponse.json({
            message: "No selection made yet"
        }, { status: 404 });  // 返回 200 状态码，提示用户还没有选择
    }
    return NextResponse.json({ record }, { status: 200 });
}

export async function POST(request: NextRequest) {
    try {
        const { userId, topicId, choice } = (await request.json()) as RecordRequest;
        if (!userId || !topicId || !choice) {
            return NextResponse.json({
                message: "Bad Request"
            }, { status: 400 });
        }

        let record;

        await prisma.$transaction(async (prisma) => {
            const oldRecord = await prisma.record.findFirst({
                where: {
                    topicId: topicId,
                    userId: userId
                }
            });
            if (oldRecord) {
                const topic = await prisma.topic.findUnique({
                    where: {
                        id: topicId
                    },
                    include: {
                        options: true // 这里应该是 TopicOption，而不是 options
                    }
                });
                const selectedOption = topic?.options.find(
                    option => option.key === oldRecord.choice
                );
                if (selectedOption) {
                    await prisma.topicOption.update({
                        where: {
                            id: selectedOption.id
                        },
                        data: {
                            value: selectedOption.value - 1
                        }
                    });
                }
                await prisma.record.delete({
                    where: {
                        id: oldRecord.id
                    }
                });
            }
            
            const topic = await prisma.topic.findUnique({
                where: {
                    id: topicId
                },
                include: {
                    options: true
                }
            });
            const selectedOption = topic?.options.find(
                option => option.key === choice
            );
            if (selectedOption) {
                await prisma.topicOption.update({
                    where: {
                        id: selectedOption.id
                    },
                    data: {
                        value: selectedOption.value + 1
                    }
                });
            }
            record = await prisma.record.create({
                data: {
                    topicId,
                    userId,
                    choice
                }
            });
        });

        return NextResponse.json({
            record
        }, { status: 200 });
    } catch (e) {
        console.error("🚀 ~ file: route.ts:6 ~ POST ~ e:", e);
        return NextResponse.json({
            message: "Internal Error"
        }, { status: 500 });
    }
}