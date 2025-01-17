import { api } from "@/trpc/server";
import InterviewFail from "./_components/fail";
import InterviewReview from "./_components/interview-review";

export default async function InterviewPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const interviewId = (await params).id;
    const interviewMessages = await api.InterviewRouter.getAllMessages({
        interviewId,
    });

    if (!interviewId) {
        return <InterviewFail errorMessage="No intervew found with this ID." />;
    }

    // Add case to continue the interview if tab is closed
    // Add back the interview client comp if interview is not finished

    return (
        <main className="min-h-screen bg-gray-50">
            <InterviewReview messages={interviewMessages} />
        </main>
    );
}
