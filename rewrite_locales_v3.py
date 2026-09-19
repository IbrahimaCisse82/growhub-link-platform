import re

def rewrite(path, lang):
    with open(path, 'r') as f:
        content = f.read()
    
    if lang == "fr":
        new_block = """    weeklyDigest: {
      title: "Digest Hebdo",
      thisWeek: "Cette semaine",
      summaryTitle: "Résumé de la semaine",
      calmWeek: "Semaine calme — c'est le moment de poster et d'élargir votre réseau !",
      explosiveWeek: "🔥 Semaine explosive ! {{count}} nouvelles connexions, votre réseau s'emballe !",
      goodWeek: "Bonne semaine ! {{count}} nouvelles connexions et des opportunités en vue.",
      postsCarton: "Vos posts cartonnent ! {{count}} likes cette semaine.",
      stats: {
        newConnections: "Nouvelles connexions",
        profileViews: "Vues profil",
        newMessages: "Messages reçus",
        likesReceived: "Likes reçus",
      },
      upcomingEvents: "Événements à venir",
      analytics: "Analytics",
      developNetworkShort: "Développer mon",
      network: "Réseau",
      defaultConnectionName: "Connexion",
    },\n"""
    else:
        new_block = """    weeklyDigest: {
      title: "Weekly Digest",
      thisWeek: "This week",
      summaryTitle: "Week summary",
      calmWeek: "Quiet week — a good time to post and grow your network!",
      explosiveWeek: "🔥 Explosive week! {{count}} new connections, your network is booming!",
      goodWeek: "Good week! {{count}} new connections and opportunities in sight.",
      postsCarton: "Your posts are on fire! {{count}} likes this week.",
      stats: {
        newConnections: "New connections",
        profileViews: "Profile views",
        newMessages: "Messages received",
        likesReceived: "Likes received",
      },
      upcomingEvents: "Upcoming events",
      analytics: "Analytics",
      developNetworkShort: "Grow my",
      network: "Network",
      defaultConnectionName: "Connection",
    },\n"""

    # Use a regex that is greedy enough to capture the whole mess
    content = re.sub(r'weeklyDigest: \{.*?milestone:', new_block + '    milestone:', content, flags=re.DOTALL)
    
    with open(path, 'w') as f:
        f.write(content)

rewrite("src/i18n/locales/fr.c4.ts", "fr")
rewrite("src/i18n/locales/en.c4.ts", "en")
