export default {
  c2: {
    globalSearch: {
      typeLabels: { profile: "Member", post: "Post", event: "Event" },
      searchButtonPlaceholder: "Search...",
      inputPlaceholder: "Search members, posts, events...",
      filters: { all: "All", profile: "Members", post: "Posts", event: "Events" },
      advanced: {
        title: "Advanced filters",
        reset: "Reset",
        role: "Role",
        sector: "Sector",
        city: "City",
        cityPlaceholder: "E.g: Paris, Lyon, Dakar...",
        openButton: "Open advanced filters",
      },
      loading: "Searching...",
      typeAtLeast: "Type at least 2 characters or use the advanced filters",
      noResults: "No results",
      noResultsFor: 'No results for "{{query}}"',
      withFilters: " with these filters",
      footer: {
        hint: "↑↓ Navigate · ↵ Open · Esc Close",
        resultCount: "{{count}} result",
        resultCount_plural: "{{count}} results",
      },
    },
    contextualHelp: {
      footer: "Need more help? Contact us at",
      configs: {
        dashboard: {
          title: "Help — Dashboard",
          items: [
            { question: "What does the Dashboard show?", answer: "The Dashboard is your command center. It displays your goals, key stats, activation checklist and personalized recommendations based on your profile." },
            { question: "How does the checklist work?", answer: "The activation checklist guides you to complete your profile and get the most out of the platform. Each completed action increases your network score." },
            { question: "What is the network score?", answer: "Your network score reflects your activity and engagement. The more you participate (posts, connections, events), the higher your score." },
            { question: "How can I see my streaks?", answer: "Streaks count your consecutive login days. Log in every day to keep your streak going and climb the leaderboard." },
          ],
        },
        networking: {
          title: "Help — Networking",
          items: [
            { question: "How does matching work?", answer: "Our algorithm analyzes your skills, interests and sector to recommend the most relevant profiles with a compatibility score." },
            { question: "How do I send a request?", answer: "Click 'Connect' on the desired profile. You can add a personalized message to increase your chances of acceptance." },
            { question: "Can I filter profiles?", answer: "Yes! Use the global search (⌘K) and filters by role, sector, city and skills to find exactly who you're looking for." },
            { question: "What is a verified profile?", answer: "The ✓ badge indicates that the member's identity has been verified. This builds trust in exchanges." },
          ],
        },
        coaching: {
          title: "Help — Coaching",
          items: [
            { question: "How do I book a session?", answer: "Browse available coaches, click 'Book', choose a date and topic. The coach will receive an instant notification." },
            { question: "How do I cancel a session?", answer: "In the 'Upcoming sessions' section, click the ✕ icon next to the session. Cancellation is free up to 24h before." },
            { question: "How do I rate a coach?", answer: "After a completed session, click 'Rate' in the history to give a rating and comment." },
            { question: "Are sessions paid?", answer: "The hourly rate is displayed on each coach profile. Secure payment via PayPal will be available soon." },
          ],
        },
        feed: {
          title: "Help — News feed",
          items: [
            { question: "What can I post?", answer: "Share text, milestones, questions, resources or announcements. You can also add tags and media." },
            { question: "How do reactions work?", answer: "Click the emoji to react to a post. The author receives a real-time notification." },
            { question: "What is a poll?", answer: "Create a poll with your post to gather community feedback. Results are visible in real time." },
          ],
        },
        messaging: {
          title: "Help — Messaging",
          items: [
            { question: "How do I start a conversation?", answer: "Go to a connected member's profile and click 'Message', or use the Messaging page to find your conversations." },
            { question: "Are messages real-time?", answer: "Yes! Messages arrive instantly thanks to our real-time system. You also get a notification toast." },
            { question: "Can I send files?", answer: "For now, messaging only supports text. File and image sending will be available soon." },
          ],
        },
        events: {
          title: "Help — Events",
          items: [
            { question: "How do I register?", answer: "Click 'Register' on the desired event. You'll receive a reminder notification before it starts." },
            { question: "How do I create an event?", answer: "Click 'Create event' and fill in the details (title, date, type, video link). Your events are visible to the whole community." },
            { question: "What types of events?", answer: "Webinars, workshops, meetups, conferences and demo days. Each type has its own adapted format." },
          ],
        },
      },
    },
    errorBoundary: {
      title: "Oops, an error occurred",
      reload: "Reload page",
    },
    pwaInstall: {
      title: "Install GrowHub",
      description: "Quickly access GrowHub from your home screen.",
      installButton: "Install the app",
    },
    pushNotif: {
      enabledSuccess: "Notifications enabled!",
      deniedError: "Notifications denied. You can enable them in your browser settings.",
      enabledLabel: "Notifications enabled",
      blockedLabel: "Notifications blocked in the browser",
      enableButton: "Enable push notifications",
    },
    messageTemplates: {
      defaults: {
        connectionRequest: { title: "Connection request", content: "Hello {{nom}}, I saw your profile and I think we could have interesting synergies. Would you be available for a chat?" },
        warmIntro: { title: "Warm introduction request", content: "Hello {{nom}}, I would love to be introduced to {{cible}}. Do you think you could facilitate this introduction?" },
        eventFollowup: { title: "Follow-up after event", content: "Hello {{nom}}, glad to have met you at {{événement}}. I'd like to continue our conversation. When would you be available?" },
        collaboration: { title: "Collaboration proposal", content: "Hello {{nom}}, I'm working on {{projet}} and I think your expertise in {{domaine}} could be complementary. Shall we discuss?" },
      },
      categories: {
        networking: "Networking",
        intro: "Introduction",
        followup: "Follow-up",
        collaboration: "Collaboration",
        other: "Other",
      },
      title: "Message templates",
      compactTitle: "Templates",
      create: "Create",
      cancel: "Cancel",
      save: "Save",
      titlePlaceholder: "Template name",
      contentPlaceholder: "Content (use {{variable}} for dynamic fields)",
      createdSuccess: "Template created!",
      deletedSuccess: "Template deleted",
      copiedSuccess: "Copied to clipboard!",
    },
  },
};
