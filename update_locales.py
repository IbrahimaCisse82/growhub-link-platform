import re

def update_file(path, conn_name):
    with open(path, 'r') as f:
        content = f.read()
    
    # Find the weeklyDigest block inside c4
    # We want to insert 'defaultConnectionName: "...",' inside weeklyDigest
    
    match = re.search(r'(weeklyDigest: \{)(.*?)(\},)', content, re.DOTALL)
    if match:
        header = match.group(1)
        body = match.group(2)
        footer = match.group(3)
        
        if 'defaultConnectionName' not in body:
            new_body = body + f'      defaultConnectionName: "{conn_name}",\n'
            content = content.replace(match.group(0), header + new_body + footer)
    
    with open(path, 'w') as f:
        f.write(content)

update_file("src/i18n/locales/fr.c4.ts", "Connexion")
update_file("src/i18n/locales/en.c4.ts", "Connection")
