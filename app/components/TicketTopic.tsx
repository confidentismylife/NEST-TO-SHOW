"use client";

import { Record } from "@/util/type";
import { useAuth, useUser } from "@clerk/nextjs";
import {
    Card,
    CardHeader,
    CardBody,
    Image,
    Avatar,
    Divider,
    CardFooter,
    RadioGroup,
    Radio,
    cn,
    Progress,
} from "@nextui-org/react";
import { useEffect, useState } from "react";

interface Props {
    id?: string;
    avatar?: string;
    userId?: string;
    content?: string;
    images?: string[];
    options: Array<{ key: string; value: number }>;
}

function TicketTopic(props: Props) {
    const [count, setCount] = useState(
        props.options.reduce((acc, item) => acc + item.value, 0)
    );
    const [selectedChoice, setSelectedChoice] = useState("");
    const [isVote, setIsVote] = useState(false);
    const [record, setRecord] = useState<Record>();
    const [options, setOptions] = useState<typeof props.options>(props.options);
    const { userId } = useAuth();
    const { user } = useUser();

    useEffect(() => {
        const fetchIsVote = async () => {
            try {
                const result = await fetch(
                    `${process.env.API_ADDRESS}/topic/record?userId=${userId}&topicId=${props.id}`,
                    {
                        method: "GET",
                        cache: "no-cache",
                    }
                );
                if (result.status === 200) {
                    const data = await result.json();
                    if (data.record) {
                        const record = data.record as Record;
                        setIsVote(true);
                        setRecord(record);
                        setSelectedChoice(record.choice);
                    } else {
                        console.error("No record found in response");
                    }
                } else {
                    console.error("Failed to fetch vote record");
                }
            } catch (error) {
                console.error("Error fetching vote record:", error);
            }
        };
        fetchIsVote();
    }, [props.id, userId]);

    useEffect(() => {
        setCount(options.reduce((acc, item) => acc + item.value, 0));
    }, [options]);

    const handleValueChange = async (value: string) => {
        const newOptions = options.map(item => {
            if (item.key === value) {
                return { key: item.key, value: item.value + 1 };
            }
            if (item.key === selectedChoice) {
                return { key: item.key, value: item.value - 1 };
            }
            return item;
        });

        setOptions(newOptions);
        if (selectedChoice === "") setCount(prevCount => prevCount + 1);
        setSelectedChoice(value);

        try {
            const result = await fetch(`${process.env.API_ADDRESS}/topic/record`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    topicId: props.id,
                    userId: userId,
                    choice: value,
                }),
            });

            if (result.status === 200) {
                setIsVote(true);
            } else {
                console.error("Failed to record vote");
            }
        } catch (error) {
            console.error("Error recording vote:", error);
        }
    };

    return (
        <>
            <div className="w-10/12">
                <Card>
                    <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                        <div className="flex ">
                            <Avatar src={props.avatar} />
                            <h4 className="text-lg font-bold ml-2 mt-1" >{user?.fullName}</h4>
                        </div>
                        <p className="text-2xl mt-4 ">{props.content}</p>
                    </CardHeader>
                    <CardBody className="overflow-visible py-2">
                        {Array.isArray(props.images) && props.images.map((image, index) => (
                            <Image
                                key={index}
                                alt="Card image"
                                className="object-cover rounded-xl my-1"
                                src={image}
                                width={270}
                            />
                        ))}
                    </CardBody>
                    <CardFooter className="px-4 py-2 flex flex-col justify-center">
                        <RadioGroup
                            orientation="horizontal"
                            value={selectedChoice}
                            onValueChange={handleValueChange}
                        >
                            {props.options.map((item) => (
                                <Radio
                                    key={item.key}
                                    value={item.key}
                                    className={cn(
                                        "inline-flex m-0 bg-content1 hover:bg-content2 items-center justify-between",
                                        "flex-row-reverse max-w-[300px] cursor-pointer rounded-lg gap-4 p-4 border-2 border-transparent",
                                        "data-[selected=true]:border-primary"
                                    )}
                                >
                                    {item.key}
                                </Radio>
                            ))}
                        </RadioGroup>

                        {isVote &&
                            options.map((item) => (
                                <Progress
                                    key={item.key}
                                    size="sm"
                                    radius="sm"
                                    classNames={{
                                        base: "max-w-md",
                                        track: "drop-shadow-md border border-default",
                                        indicator: "bg-gradient-to-r from-pink-500 to-yellow-500",
                                        label: "tracking-wider font-medium text-default-600",
                                        value: "text-foreground/60",
                                    }}
                                    label={item.key}
                                    value={count === 0 ? 0 : (item.value / count) * 100}
                                    showValueLabel={true}
                                />
                            ))}
                    </CardFooter>
                </Card>
            </div>
            <Divider className="my-4" />
        </>
    );
}

export default TicketTopic;
