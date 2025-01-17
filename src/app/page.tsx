import StartInterview from "./_components/start-interview";

export default async function Home() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
            <h1 className="mb-8 text-4xl font-bold">
                Welcome to Mock AI Interview
            </h1>
            <StartInterview />
        </div>
    );
}
