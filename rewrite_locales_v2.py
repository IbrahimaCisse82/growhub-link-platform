import re

def rewrite(path, lang):
    with open(path, 'r') as f:
        lines = f.readlines()
    
    start_idx = -1
    end_idx = -1
    for i, line in enumerate(lines):
        if 'weeklyDigest: {' in line:
            start_idx = i
        if start_idx != -1 and 'milestone: {' in line:
            # The weeklyDigest block ends before milestone
            # We need to find the last }, before milestone
            for j in range(i-1, start_idx, -1):
                if '},' in lines[j]:
                    end_idx = j
                    break
            break
    
    if start_idx != -1 and end_idx != -1:
        if lang == "fr":
            new_lines = [
                '    weeklyDigest: {\n',
                '      title: "Digest Hebdo",\n',
                '      thisWeek: "Cette semaine",\n',
                '      summaryTitle: "Résumé de la semaine",\n',
                '      calmWeek: "Semaine calme — c\'est le moment de poster et d\'élargir votre réseau !",\n',
                '      explosiveWeek: "🔥 Semaine explosive ! {{count}} nouvelles connexions, votre réseau s\'emballe !",\n',
                '      goodWeek: "Bonne semaine ! {{count}} nouvelles connexions et des opportunités en vue.",\n',
                '      postsCarton: "Vos posts cartonnent ! {{count}} likes cette semaine.",\n',
                '      stats: {\n',
                '        newConnections: "Nouvelles connexions",\n',
                '        profileViews: "Vues profil",\n',
                '        newMessages: "Messages reçus",\n',
                '        likesReceived: "Likes reçus",\n',
                '      },\n',
                '      upcomingEvents: "Événements à venir",\n',
                '      analytics: "Analytics",\n',
                '      developNetworkShort: "Développer mon",\n',
                '      network: "Réseau",\n',
                '      defaultConnectionName: "Connexion",\n',
                '    },\n'
            ]
        else:
            new_lines = [
                '    weeklyDigest: {\n',
                '      title: "Weekly Digest",\n',
                '      thisWeek: "This week",\n',
                '      summaryTitle: "Week summary",\n',
                '      calmWeek: "Quiet week — a good time to post and grow your network!",\n',
                '      explosiveWeek: "🔥 Explosive week! {{count}} new connections, your network is booming!",\n',
                '      goodWeek: "Good week! {{count}} new connections and opportunities in sight.",\n',
                '      postsCarton: "Your posts are on fire! {{count}} likes this week.",\n',
                '      stats: {\n',
                '        newConnections: "New connections",\n',
                '        profileViews: "Profile views",\n',
                '        newMessages: "Messages received",\n',
                '        likesReceived: "Likes received",\n',
                '      },\n',
                '      upcomingEvents: "Upcoming events",\n',
                '      analytics: "Analytics",\n',
                '      developNetworkShort: "Grow my",\n',
                '      network: "Network",\n',
                '      defaultConnectionName: "Connection",\n',
                '    },\n'
            ]
        
        final_lines = lines[:start_idx] + new_lines + lines[end_idx+1:]
        with open(path, 'w') as f:
            f.writelines(final_lines)

rewrite("src/i18n/locales/fr.c4.ts", "fr")
rewrite("src/i18n/locales/en.c4.ts", "en")
