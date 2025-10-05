"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { CreationStream } from '@/components/studio';
import { InspirationHub } from '@/components/studio/InspirationHub';
import { TaraStudioProvider } from '@/lib/contexts/TaraStudioContext';
import { StudioAmbiance, TodaysNarrativeHeader } from '@/components/studio';
import { AnalyzeCreateHub } from '@/components/studio/AnalyzeCreateHub';
import { FancyButton } from '@/components/ui/FancyButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

export default function CreativeStudioPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState('create');

  // State for initialization
  const [isInitializing, setIsInitializing] = React.useState(false);
  const [lastInitTime, setLastInitTime] = React.useState<string | null>(null);
  const [initMethod, setInitMethod] = React.useState<'n8n' | 'local' | null>(null);

  // Silent initialization - runs once when component mounts
  React.useEffect(() => {
    const initializeStudio = async () => {
      try {
        setIsInitializing(true);
        // Check if studio needs initialization
        const checkRes = await fetch('/api/studio/check-initialization');
        const checkData = await checkRes.json();

        if (!checkData.initialized) {
          // Try n8n first if enabled
          if (process.env.NEXT_PUBLIC_N8N_ENABLED === 'true') {
            try {
              console.log('Triggering n8n daily awakening...');
              const response = await fetch('/api/studio/trigger-awakening', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ force: false })
              });
              
              if (response.ok) {
                console.log('n8n daily awakening completed');
                setInitMethod('n8n');
                setLastInitTime(new Date().toISOString());
                return;
              }
            } catch (n8nError) {
              console.warn('n8n awakening failed, falling back to auto-seed:', n8nError);
            }
          }
          
          // Fallback to local auto-seed
          await fetch('/api/studio/auto-seed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          setInitMethod('local');
          setLastInitTime(new Date().toISOString());
        } else {
          setInitMethod(checkData.method || 'local');
          setLastInitTime(checkData.lastInitTime);
        }
      } catch (error) {
        console.warn('Silent initialization failed:', error);
        // Continue anyway - manual creation will still work
      } finally {
        setIsInitializing(false);
      }
    };

    // Run initialization after a short delay to avoid blocking initial render
    const timer = setTimeout(initializeStudio, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <TaraStudioProvider>
      <main className="relative min-h-screen p-6 bg-tara-bg-dark overflow-x-hidden">
        <StudioAmbiance mode="auto" />

        {/* Back Button */}
        <FancyButton
          icon="←"
          variant="default"
          size="sm"
          onClick={() => router.push('/')}
          className="fixed top-4 left-4 z-10"
          ariaLabel="Back to home"
        />

        <div className="relative max-w-6xl mx-auto space-y-6">
          {/* Studio Status */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <TodaysNarrativeHeader />
            {initMethod && (
              <div className="absolute top-0 right-0 flex items-center space-x-2 text-sm text-gray-400">
                <span className={`inline-block w-2 h-2 rounded-full ${
                  isInitializing ? 'bg-yellow-400 animate-pulse' :
                  initMethod === 'n8n' ? 'bg-green-400' : 'bg-blue-400'
                }`} />
                <span>
                  {isInitializing ? 'Initializing...' :
                   `Using ${initMethod === 'n8n' ? 'AI-powered' : 'local'} generation`}
                </span>
                {lastInitTime && (
                  <span className="text-xs">
                    (Last updated: {new Date(lastInitTime).toLocaleTimeString()})
                  </span>
                )}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="create">
                  ✨ Create Content
                </TabsTrigger>
                <TabsTrigger value="analyze">
                  🔍 Analyze & Create
                </TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="space-y-6">
                <InspirationHub />
                <CreationStream />
              </TabsContent>

              <TabsContent value="analyze" className="space-y-6">
                <AnalyzeCreateHub />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
    </TaraStudioProvider>
  );
}
