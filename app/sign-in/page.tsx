export default function SignInPage() {
    return (
        <div className="h-screen w-full flex flex-col justify-center items-center">
            <div className="min-w-[80rem] bg-slate-900/80 backdrop-blur-md shadow-2xl rounded-3xl p-6 border-2 border-slate-700/50 flex flex-col justify-between items-center gap-8 shrink-0">
                <p className="font-bold text-2xl text-white tracking-tight mb-2">Sign in</p>

                <form className="flex flex-col gap-2 p-6 w-full">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-white">Email Address</label>
                        <input type="text" required className="bg-white border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-white">Password</label>
                        <input type="password" required className="bg-white border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500" />
                    </div>
                </form>
            </div>
        </div>
    )
}