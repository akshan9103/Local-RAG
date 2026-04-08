import Link from "next/link";
import Header from "@/components/header";
import { 
  Database, 
  Cpu, 
  ShieldCheck, 
  ArrowRight, 
  Search, 
  Server, 
  MessageSquareText 
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Navigation / Header - Minimal */}

      <Header />

      <main className="max-w-6xl mx-auto px-6 py-16 md:py-40 space-y-16">
        
        {/* Hero Section */}
        <section className="text-center space-y-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
              Local LLM RAG System
            </h1>
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-light">
              A local retrieval-augmented generation system designed for secure document-based question answering using locally deployed language models.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href="/register"
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-md font-medium text-sm transition-all shadow-sm flex items-center justify-center gap-2 group"
            >
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link 
              href="/login"
              className="w-full sm:w-auto px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-700 rounded-md font-medium text-sm transition-all shadow-sm flex items-center justify-center"
            >
              Sign In
            </Link>
          </div>
        </section>

        {/* Architecture Preview Section */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-slate-800 tracking-tight">System Architecture</h2>
            <p className="text-sm text-slate-500">High-level data flow for inference</p>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
              
              {/* Step 1 */}
              <div className="flex flex-col items-center gap-3 w-32">
                <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <Search className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-700 text-center">User Query</span>
              </div>

              <ArrowRight className="w-5 h-5 text-slate-300 hidden md:block" />
              <ArrowRight className="w-5 h-5 text-slate-300 block md:hidden rotate-90" />

              {/* Step 2 */}
              <div className="flex flex-col items-center gap-3 w-32">
                <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center text-slate-600">
                  <Database className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-700 text-center">Retriever</span>
              </div>

              <ArrowRight className="w-5 h-5 text-slate-300 hidden md:block" />
              <ArrowRight className="w-5 h-5 text-slate-300 block md:hidden rotate-90" />

              {/* Step 3 */}
              <div className="flex flex-col items-center gap-3 w-32">
                <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center text-slate-600">
                  <Server className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-700 text-center">Local LLM</span>
              </div>

              <ArrowRight className="w-5 h-5 text-slate-300 hidden md:block" />
              <ArrowRight className="w-5 h-5 text-slate-300 block md:hidden rotate-90" />

              {/* Step 4 */}
              <div className="flex flex-col items-center gap-3 w-32">
                <div className="w-12 h-12 bg-green-50 border border-green-100 rounded-full flex items-center justify-center text-green-600">
                  <MessageSquareText className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-700 text-center">Response</span>
              </div>

            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-slate-800 tracking-tight">Core Methodologies</h2>
            <p className="text-sm text-slate-500">Technical implementation pillars of the project</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group">
              <div className="w-10 h-10 bg-slate-50 rounded-md flex items-center justify-center mb-4 text-slate-600 group-hover:text-blue-600 transition-colors">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-800 mb-2">Local Model Execution</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Utilizes quantized open-weights models executed entirely on local hardware constraints, ensuring low-latency inference without external API dependencies.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group">
              <div className="w-10 h-10 bg-slate-50 rounded-md flex items-center justify-center mb-4 text-slate-600 group-hover:text-blue-600 transition-colors">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-800 mb-2">Retrieval-Augmented Generation</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Integrates vector embeddings and similarity search to ground generation in verified document sets, significantly mitigating hallucination rates.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group">
              <div className="w-10 h-10 bg-slate-50 rounded-md flex items-center justify-center mb-4 text-slate-600 group-hover:text-blue-600 transition-colors">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-800 mb-2">Secure Offline Processing</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Operates entirely in an isolated environment. Data remains strictly on-device, satisfying requirements for handling sensitive academic or proprietary data.
              </p>
            </div>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center justify-center gap-2">
          <p className="text-sm font-medium text-slate-700">LocalRaG.</p>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            Frontend with Next.js, TypeScript, and Tailwind CSS.
          </p>
        </div>
      </footer>
    </div>
  );
}