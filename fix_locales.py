import re

def fix_file(path, conn_name):
    with open(path, 'r') as f:
        content = f.read()
    
    # Remove the misplaced defaultConnectionName if it exists
    content = re.sub(r'\s+defaultConnectionName: ".*?",\n', '', content)
    
    # Find weeklyDigest and insert it correctly at the end of its block
    # weeklyDigest: { ...
    #   network: "...",
    # },
    
    pattern = r'(weeklyDigest: \{.*?network: ".*?",\n)(\s+\},)'
    replacement = r'\1      defaultConnectionName: "' + conn_name + '",\n\2'
    
    if re.search(pattern, content, re.DOTALL):
        content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    with open(path, 'w') as f:
        f.write(content)

fix_file("src/i18n/locales/fr.c4.ts", "Connexion")
fix_file("src/i18n/locales/en.c4.ts", "Connection")
