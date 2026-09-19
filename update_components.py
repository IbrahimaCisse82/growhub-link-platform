import re
import os

def update_weekly_digest():
    path = "src/components/WeeklyDigest.tsx"
    with open(path, 'r') as f:
        content = f.read()
    
    # Already did some sed, but let's ensure it's correct
    # If I already ran sed, I should be careful not to double up.
    # Re-reading content to see current state.
    print(f"Updating {path}")
    # (The previous sed commands already did most of it)

def update_milestone_detector():
    path = "src/components/MilestoneDetector.tsx"
    with open(path, 'r') as f:
        content = f.read()
    
    if 'useTranslation' not in content:
        content = 'import { useTranslation } from "react-i18next";\n' + content

    # Add t inside component
    content = re.sub(r'const { user } = useAuth\(\);', 'const { user } = useAuth();\n  const { t } = useTranslation();', content)

    # Move MILESTONE_THRESHOLDS inside the component
    # Find the const definition
    match = re.search(r'const MILESTONE_THRESHOLDS: .*? = \[(.*?)\];', content, re.DOTALL)
    if match:
        thresholds_body = match.group(1)
        # Remove it from outside
        content = content.replace(match.group(0), '')
        # Insert it inside
        content = re.sub(r'const { t } = useTranslation\(\);', 'const { t } = useTranslation();\n\n  const MILESTONE_THRESHOLDS = [' + thresholds_body + '];', content)

    # Replace the strings in thresholds with t() calls
    # Connections
    content = content.replace('label: (v) => `${v} connexions atteintes !`', 'label: (v) => t("c4.milestone.connections.label", { count: v })')
    content = content.replace('desc: (v) => `Votre réseau vient de franchir le cap des ${v} connexions. Chaque lien est une opportunité.`', 'desc: (v) => t("c4.milestone.connections.desc", { count: v })')
    content = content.replace('shareLabel: (v) => `🎉 Je viens d\'atteindre ${v} connexions sur GrowHubLink ! Mon réseau grandit et les opportunités aussi. #Networking #GrowHub`', 'shareLabel: (v) => t("c4.milestone.connections.share", { count: v })')
    
    # Posts
    content = content.replace('label: (v) => v === 1 ? "Premier post publié !" : `${v} publications !`', 'label: (v) => v === 1 ? t("c4.milestone.posts.labelFirst") : t("c4.milestone.posts.label", { count: v })')
    content = content.replace('desc: (v) => v === 1 ? "Vous venez de publier votre tout premier post. Bienvenue dans la communauté !" : `Vous avez publié ${v} posts. Votre voix compte dans l\'écosystème.`', 'desc: (v) => v === 1 ? t("c4.milestone.posts.descFirst") : t("c4.milestone.posts.desc", { count: v })')
    content = content.replace('shareLabel: (v) => v === 1 ? "📝 Je viens de publier mon premier post sur GrowHubLink ! #Startup #GrowHub" : `📝 ${v} posts publiés sur GrowHubLink ! Partager, c\'est grandir ensemble. #GrowHub`', 'shareLabel: (v) => v === 1 ? t("c4.milestone.posts.shareFirst") : t("c4.milestone.posts.share", { count: v })')

    # Events
    content = content.replace('label: (v) => v === 1 ? "Premier événement !" : `${v} événements suivis !`', 'label: (v) => v === 1 ? t("c4.milestone.events.labelFirst") : t("c4.milestone.events.label", { count: v })')
    content = content.replace('desc: (v) => `Vous avez participé à ${v} événement${v > 1 ? "s" : ""}. Le networking en action !`', 'desc: (v) => t("c4.milestone.events.desc", { count: v, plural: v > 1 ? "s" : "" })')
    content = content.replace('shareLabel: (v) => `📅 ${v} événement${v > 1 ? "s" : ""} sur GrowHubLink ! Toujours en mouvement. #Events #GrowHub`', 'shareLabel: (v) => t("c4.milestone.events.share", { count: v, plural: v > 1 ? "s" : "" })')

    # Badges
    content = content.replace('label: (v) => v === 1 ? "Premier badge débloqué !" : `${v} badges collectés !`', 'label: (v) => v === 1 ? t("c4.milestone.badges.labelFirst") : t("c4.milestone.badges.label", { count: v })')
    content = content.replace('desc: (v) => `Vous avez obtenu ${v} badge${v > 1 ? "s" : ""}. La preuve de votre engagement.`', 'desc: (v) => t("c4.milestone.badges.desc", { count: v, plural: v > 1 ? "s" : "" })')
    content = content.replace('shareLabel: (v) => `🏆 ${v} badge${v > 1 ? "s" : ""} débloqué${v > 1 ? "s" : ""} sur GrowHubLink ! #Achievement #GrowHub`', 'shareLabel: (v) => t("c4.milestone.badges.share", { count: v, plural: v > 1 ? "s" : "" })')

    # Coaching
    content = content.replace('label: (v) => v === 1 ? "Première session de coaching !" : `${v} sessions de coaching !`', 'label: (v) => v === 1 ? t("c4.milestone.coaching.labelFirst") : t("c4.milestone.coaching.label", { count: v })')
    content = content.replace('desc: (v) => `${v} session${v > 1 ? "s" : ""} de coaching complétée${v > 1 ? "s" : ""}. L\'apprentissage continu paie toujours.`', 'desc: (v) => t("c4.milestone.coaching.desc", { count: v, plural: v > 1 ? "s" : "" })')
    content = content.replace('shareLabel: (v) => `🎓 ${v} session${v > 1 ? "s" : ""} de coaching sur GrowHubLink ! Investir en soi, c\'est la clé. #Coaching #GrowHub`', 'shareLabel: (v) => t("c4.milestone.coaching.share", { count: v, plural: v > 1 ? "s" : "" })')

    # Toast
    content = content.replace('toast.success("Milestone partagé dans le feed !");', 'toast.success(t("c4.milestone.shareSuccess"));')
    
    # JSX
    content = content.replace('>Nouveaux Milestones 🎉</h2>', '>{t("c4.milestone.newMilestones")}</h2>')
    content = content.replace('> Partager dans le feed', '> {t("c4.milestone.shareInFeed")}')
    content = content.replace('> LinkedIn', '> {t("c4.milestone.linkedin")}')

    with open(path, 'w') as f:
        f.write(content)

def update_shareable_achievements():
    path = "src/components/ShareableAchievementCards.tsx"
    with open(path, 'r') as f:
        content = f.read()
    
    if 'useTranslation' not in content:
        content = 'import { useTranslation } from "react-i18next";\n' + content
    
    content = re.sub(r'const { user, profile } = useAuth\(\);', 'const { user, profile } = useAuth();\n  const { t } = useTranslation();', content)
    
    # Update Achievement definitions in queryFn
    content = content.replace('title: "Réseau professionnel"', 'title: t("c4.achievements.network.title")')
    content = content.replace('subtitle: `${name} sur GrowHubLink`', 'subtitle: t("c4.achievements.network.subtitle", { name })')
    content = content.replace('value: `${connections} connexions`', 'value: t("c4.achievements.network.value", { count: connections })')
    content = content.replace('shareText: `🌐 ${connections} connexions professionnelles sur GrowHubLink ! Mon réseau est ma force. #Networking #GrowHub`', 'shareText: t("c4.achievements.network.shareText", { count: connections })')

    content = content.replace('title: "Créateur de contenu"', 'title: t("c4.achievements.content.title")')
    content = content.replace('subtitle: `${totalLikes} likes récoltés`', 'subtitle: t("c4.achievements.content.subtitle", { likes: totalLikes })')
    content = content.replace('value: `${posts} publications`', 'value: t("c4.achievements.content.value", { count: posts })')
    content = content.replace('shareText: `📝 ${posts} posts et ${totalLikes} likes sur GrowHubLink ! Le partage de connaissances, c\'est la clé. #ContentCreator #GrowHub`', 'shareText: t("c4.achievements.content.shareText", { posts, likes: totalLikes })')

    content = content.replace('title: "Participant actif"', 'title: t("c4.achievements.engagement.title")')
    content = content.replace('subtitle: "Événements & networking"', 'subtitle: t("c4.achievements.engagement.subtitle")')
    content = content.replace('value: `${events} événements`', 'value: t("c4.achievements.engagement.value", { count: events })')
    content = content.replace('shareText: `📅 ${events} événements sur GrowHubLink ! Toujours en mouvement, toujours en réseau. #Events #GrowHub`', 'shareText: t("c4.achievements.engagement.shareText", { count: events })')

    content = content.replace('title: "Collectionneur"', 'title: t("c4.achievements.achievement.title")')
    content = content.replace('subtitle: "Badges d\'accomplissement"', 'subtitle: t("c4.achievements.achievement.subtitle")')
    content = content.replace('value: `${badges} badges`', 'value: t("c4.achievements.achievement.value", { count: badges })')
    content = content.replace('shareText: `🏆 ${badges} badges débloqués sur GrowHubLink ! Chaque badge raconte une histoire. #Achievement #GrowHub`', 'shareText: t("c4.achievements.achievement.shareText", { count: badges })')

    content = content.replace('title: "Apprenant engagé"', 'title: t("c4.achievements.growth.title")')
    content = content.replace('subtitle: "Sessions de coaching"', 'subtitle: t("c4.achievements.growth.subtitle")')
    content = content.replace('value: `${coaching} sessions`', 'value: t("c4.achievements.growth.value", { count: coaching })')
    content = content.replace('shareText: `🎓 ${coaching} sessions de coaching sur GrowHubLink ! L\'investissement en soi est le meilleur ROI. #Coaching #GrowHub`', 'shareText: t("c4.achievements.growth.shareText", { count: coaching })')

    content = content.replace('title: "Professionnel reconnu"', 'title: t("c4.achievements.trust.title")')
    content = content.replace('subtitle: "Recommandations reçues"', 'subtitle: t("c4.achievements.trust.subtitle")')
    content = content.replace('value: `${endorsements} endorsements`', 'value: t("c4.achievements.trust.value", { count: endorsements })')
    content = content.replace('shareText: `⭐ ${endorsements} recommandations sur GrowHubLink ! La confiance se construit ensemble. #Endorsements #GrowHub`', 'shareText: t("c4.achievements.trust.shareText", { count: endorsements })')

    # Toast
    content = content.replace('toast.success("Texte copié !");', 'toast.success(t("c4.achievements.copySuccess"));')

    # JSX
    content = content.replace('>Vos Achievements partageables</h3>', '>{t("c4.achievements.heading")}</h3>')
    content = content.replace('>Nouveau</Tag>', '>{t("c4.achievements.badgeNew")}</Tag>')
    content = content.replace('>Partagez vos succès sur les réseaux sociaux et attirez de nouvelles connexions.</p>', '>{t("c4.achievements.description")}</p>')
    content = content.replace('> LinkedIn', '> {t("c4.achievements.linkedin")}')
    content = content.replace('> X', '> {t("c4.achievements.x")}')
    content = content.replace('title="Copier le texte"', 'title={t("c4.achievements.copyTooltip")}')

    with open(path, 'w') as f:
        f.write(content)

def update_linkedin_import():
    path = "src/components/LinkedInImport.tsx"
    with open(path, 'r') as f:
        content = f.read()
    
    if 'useTranslation' not in content:
        content = 'import { useTranslation } from "react-i18next";\n' + content
    
    content = re.sub(r'const { user, profile, refetchProfile } = useAuth\(\);', 'const { user, profile, refetchProfile } = useAuth();\n  const { t } = useTranslation();', content)
    
    content = content.replace('toast.success("Profil mis à jour depuis LinkedIn !");', 'toast.success(t("c4.linkedinImport.updateSuccess"));')

    # JSX
    content = content.replace('>Import LinkedIn</h3>', '>{t("c4.linkedinImport.title")}</h3>')
    content = content.replace('>Importez vos informations depuis votre profil LinkedIn</p>', '>{t("c4.linkedinImport.subtitle")}</p>')
    content = content.replace('💡 Copiez les informations de votre profil LinkedIn ci-dessous. Seuls les champs remplis seront mis à jour.', '{t("c4.linkedinImport.infoBox")}')
    
    # Labels
    content = content.replace('> Nom complet</label>', '> {t("c4.linkedinImport.fields.fullName")}</label>')
    content = content.replace('> Titre / Headline</label>', '> {t("c4.linkedinImport.fields.headline")}</label>')
    content = content.replace('> Entreprise</label>', '> {t("c4.linkedinImport.fields.company")}</label>')
    content = content.replace('> Ville</label>', '> {t("c4.linkedinImport.fields.city")}</label>')
    content = content.replace('>Secteur</label>', '>{t("c4.linkedinImport.fields.sector")}</label>')
    content = content.replace('> URL LinkedIn</label>', '> {t("c4.linkedinImport.fields.linkedinUrl")}</label>')
    content = content.replace('>Compétences (séparées par virgules)</label>', '>{t("c4.linkedinImport.fields.skills")}</label>')
    content = content.replace('>Bio / Résumé</label>', '>{t("c4.linkedinImport.fields.bio")}</label>')

    # Placeholders
    content = content.replace('placeholder={profile?.display_name || "John Doe"}', 'placeholder={profile?.display_name || t("c4.linkedinImport.placeholders.fullName")}')
    content = content.replace('placeholder="CEO & Co-founder"', 'placeholder={t("c4.linkedinImport.placeholders.headline")}')
    content = content.replace('placeholder={profile?.company_name || "Ma Startup"}', 'placeholder={profile?.company_name || t("c4.linkedinImport.placeholders.company")}')
    content = content.replace('placeholder={profile?.city || "Paris"}', 'placeholder={profile?.city || t("c4.linkedinImport.placeholders.city")}')
    content = content.replace('placeholder={profile?.sector || "Tech / SaaS"}', 'placeholder={profile?.sector || t("c4.linkedinImport.placeholders.sector")}')
    content = content.replace('placeholder="https://linkedin.com/in/..."', 'placeholder="https://linkedin.com/in/..."') # keep URL placeholder
    content = content.replace('placeholder="React, Marketing, Fundraising..."', 'placeholder={t("c4.linkedinImport.placeholders.skills")}')
    content = content.replace('placeholder="Votre résumé LinkedIn..."', 'placeholder={t("c4.linkedinImport.placeholders.bio")}')

    # Buttons
    content = content.replace("> Prévisualiser l'import", '> {t("c4.linkedinImport.previewButton")}')
    content = content.replace('>Modifier</button>', '>{t("c4.linkedinImport.edit")}</button>')
    content = content.replace("> Confirmer l'import", '> {t("c4.linkedinImport.confirmImport")}')
    
    # Preview texts
    content = content.replace('<span className="font-bold">Nom :</span>', '<span className="font-bold">{t("c4.linkedinImport.preview.name")}</span>')
    content = content.replace('<span className="font-bold">Titre :</span>', '<span className="font-bold">{t("c4.linkedinImport.preview.headline")}</span>')
    content = content.replace('<span className="font-bold">Entreprise :</span>', '<span className="font-bold">{t("c4.linkedinImport.preview.company")}</span>')
    content = content.replace('<span className="font-bold">Secteur :</span>', '<span className="font-bold">{t("c4.linkedinImport.preview.sector")}</span>')
    content = content.replace('<span className="font-bold">Ville :</span>', '<span className="font-bold">{t("c4.linkedinImport.preview.city")}</span>')
    content = content.replace('<span className="font-bold">Compétences :</span>', '<span className="font-bold">{t("c4.linkedinImport.preview.skills")}</span>')
    content = content.replace('<span className="font-bold">Bio :</span>', '<span className="font-bold">{t("c4.linkedinImport.preview.bio")}</span>')

    # Success screen
    content = content.replace('>Profil mis à jour !</h4>', '>{t("c4.linkedinImport.doneTitle")}</h4>')
    content = content.replace('>Vos informations LinkedIn ont été importées avec succès.</p>', '>{t("c4.linkedinImport.doneSubtitle")}</p>')
    content = content.replace('>Importer à nouveau</button>', '>{t("c4.linkedinImport.importAgain")}</button>')

    with open(path, 'w') as f:
        f.write(content)

update_milestone_detector()
update_shareable_achievements()
update_linkedin_import()
