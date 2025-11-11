import { motion } from "framer-motion";
import Link from "next/link";

import { LogoGoogle, MessageIcon, VercelIcon } from "./icons";

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-[500px] mt-20 mx-4 md:mx-0"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="border-none bg-muted/50 rounded-2xl p-6 flex flex-col gap-4 text-zinc-500 text-sm dark:text-zinc-400 dark:border-zinc-700">
        <p className="flex flex-row justify-center gap-4 items-center text-zinc-900 dark:text-zinc-50">
          <MessageIcon />
        </p>
        <p className="text-center text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Welcome! Let&apos;s schedule a meeting.
        </p>
        <p>
          I&apos;m here to help you book a 30-minute meeting. Just let me know when you&apos;d like to meet, 
          and I&apos;ll check the available time slots for you.
        </p>
        <p>
          You can ask me things like:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>&quot;What times are available next Tuesday?&quot;</li>
          <li>&quot;I&apos;d like to schedule a meeting tomorrow afternoon&quot;</li>
          <li>&quot;Show me available slots for this Friday&quot;</li>
        </ul>
      </div>
    </motion.div>
  );
};
