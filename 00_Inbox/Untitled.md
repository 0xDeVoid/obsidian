```
function main(config) {
    if (!config.dns) config.dns = {};
    if (!config.dns['nameserver-policy']) config.dns['nameserver-policy'] = {};
    if (!config.dns['fake-ip-filter']) config.dns['fake-ip-filter'] = [];
    if (!config.rules) config.rules = [];

    if (!config.sniffer) config.sniffer = {};
    config.sniffer.enable = true;
    config.sniffer.sniff = {
        TLS: { ports: [443, 8443] },
        HTTP: { ports: [80, "8080-8880"] }
    };

    config.dns['fake-ip-filter'].push('multirouterapp.com', '+.multirouterapp.com');

    let xboxDns = 'https://xbox-dns.ru/dns-query';
    let domains = [
        'gemini.google.com',
        'generativelanguage.googleapis.com',
        'ai.google.dev'
    ];

    domains.forEach(domain => {
        config.dns['nameserver-policy'][domain] = xboxDns;
        config.dns['nameserver-policy']['+.' + domain] = xboxDns;
        config.dns['fake-ip-filter'].push(domain);
        config.dns['fake-ip-filter'].push('+.' + domain);
    });

    config.rules.unshift(
        // Жестко направляем трафик инструмента в туннель
        "DOMAIN-SUFFIX,antigravity.google,→ Remnawave",
        "DOMAIN-KEYWORD,antigravity,→ Remnawave",

        "DOMAIN-SUFFIX,multirouterapp.com,DIRECT",
        "DOMAIN,xbox-dns.ru,DIRECT",
        "IP-CIDR,111.88.96.50/32,DIRECT,no-resolve",
        "DOMAIN-SUFFIX,gemini.google.com,DIRECT",
        "DOMAIN-SUFFIX,generativelanguage.googleapis.com,DIRECT",
        "DOMAIN-SUFFIX,ai.google.dev,DIRECT",
        "DOMAIN-KEYWORD,gemini,DIRECT"
    );

    config.rules = config.rules.filter(rule => !rule.startsWith("MATCH"));
    config.rules.push("MATCH,→ Remnawave"); 

    return config;
}
```