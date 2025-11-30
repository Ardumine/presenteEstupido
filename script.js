// --- Configuração e Dados ---

const GIFTS = {
    1: { unlockCode: "12345", lockCombo: "482" }, // Exemplo
    2: { unlockCode: "67890", lockCombo: "195" },
    3: { unlockCode: "54321", lockCombo: "736" }
};

const PERIODIC_TABLE = [
    "He", "Li", "Be", "Ne", "Na", "Mg", "Al", "Si", "Cl", "Ar", "Ca", "Sc", "Ti", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "Ga", "Ge", "As", "Se", "Br", "Kr", "Rb", "Sr", "Zr", "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn", "Sb", "Te", "Xe", "Cs", "Ba", "La", "Ce", "Pr", "Nd", "Pm", "Sm", "Eu", "Gd", "Tb", "Dy", "Ho", "Er", "Tm", "Yb", "Lu", "Hf", "Ta", "Re", "Os", "Ir", "Pt", "Au", "Hg", "Tl", "Pb", "Bi", "Po", "At", "Rn", "Fr", "Ra", "Ac", "Th", "Pa", "Np", "Pu", "Am", "Cm", "Bk", "Cf", "Es", "Fm", "Md", "No", "Lr", "Rf", "Db", "Sg", "Bh", "Hs", "Mt", "Ds", "Rg", "Cn", "Nh", "Fl", "Mc", "Lv", "Ts", "Og"
];

const SPONSORS = [
    { name: "Pepsi", image: "patrocinadores/pepsi.webp" },
    { name: "Burger King", image: "patrocinadores/Burger_King.svg" },
    { name: "NSS", image: "patrocinadores/NSS.png" },
    { name: "Xiaomi", image: "patrocinadores/Xiaomi.png" }
];

const COLORS = [
    { hex: "#FF0000", name: "Vermelho", emoji: "🔴" },
    { hex: "#00FF00", name: "Verde", emoji: "🟢" },
    { hex: "#0000FF", name: "Azul", emoji: "🔵" },
    { hex: "#000000", name: "Preto", emoji: "⚫" },
    { hex: "#FFFFFF", name: "Branco", emoji: "⚪" }
];

// --- Estado Dinâmico ---
let targetColor = null;
let currentCaptcha = "";
let rules = [];

// --- Funções Auxiliares ---

function getRandomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function generateCaptcha() {
    const chars = "ABEFGHJKNPQRSTUW";
    let result = "";
    for(let i=0; i<5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// --- Funções de Refresh ---

window.refreshColor = function() {
    targetColor = getRandomColor();
    const ruleIndex = 9; // ID 10
    rules[ruleIndex].text = `A sua palavra-passe deve incluir esta cor em hexadecimal: ${targetColor.emoji} ${targetColor.name} (no formato #[6 digitos]) <button class="refresh-btn" onclick="refreshColor()">🔄</button>`;
    
    const ruleEl = document.getElementById(`rule-${ruleIndex}`);
    if (ruleEl) {
        ruleEl.querySelector('.rule-desc').innerHTML = rules[ruleIndex].text;
        const input = document.getElementById('password-input');
        validateRules(input.value);
    }
};

window.refreshCaptcha = function() {
    currentCaptcha = generateCaptcha();
    
    const ruleIndex = 11; // ID 12
    rules[ruleIndex].text = `A sua palavra-passe deve incluir este CAPTCHA: <strong>${currentCaptcha}</strong> <button class="refresh-btn" onclick="refreshCaptcha()">🔄</button>`;
    
    const ruleEl = document.getElementById(`rule-${ruleIndex}`);
    if (ruleEl) {
        ruleEl.querySelector('.rule-desc').innerHTML = rules[ruleIndex].text;
        const input = document.getElementById('password-input');
        validateRules(input.value);
    }
};

// --- Lógica do Jogo da Palavra-Passe ---

function initGameData() {
    targetColor = getRandomColor();
    currentCaptcha = generateCaptcha();

    // Definir regras
    rules = [
        {
            id: 1,
            text: "A sua palavra-passe deve ter pelo menos 5 caracteres.",
            validator: (pwd) => pwd.length >= 5
        },
        {
            id: 2,
            text: "A sua palavra-passe deve incluir um número.",
            validator: (pwd) => /\d/.test(pwd)
        },
        {
            id: 3,
            text: "A sua palavra-passe deve incluir uma letra maiúscula.",
            validator: (pwd) => /[A-Z]/.test(pwd)
        },
        {
            id: 4,
            text: "A sua palavra-passe deve incluir um caractere especial.",
            validator: (pwd) => /[^A-Za-z0-9]/.test(pwd)
        },
        {
            id: 5,
            text: "Os dígitos da sua palavra-passe devem somar 35.",
            validator: (pwd) => {
                const digits = pwd.match(/\d/g);
                if (!digits) return false;
                const sum = digits.reduce((a, b) => parseInt(a) + parseInt(b), 0);
                return sum === 35;
            }
        },
        {
            id: 6,
            text: "A sua palavra-passe deve incluir um mês do ano (em português).",
            validator: (pwd) => {
                const months = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
                return months.some(m => pwd.toLowerCase().includes(m));
            }
        },
        {
            id: 7,
            text: "A sua palavra-passe deve incluir um numeral romano.",
            validator: (pwd) => /[IVXLCDM]+/i.test(pwd)
        },
        {
            id: 8,
            text: "Os numerais romanos da sua senha devem multiplicar 35.",
            validator: (pwd) => {
                const romanValues = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
                const matches = pwd.match(/[IVXLCDM]+/gi);
                if (!matches) return false;

                let product = 1;
                let foundAny = false;

                for (const match of matches) {
                    const upper = match.toUpperCase();
                    if (/^M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/.test(upper)) {
                        let val = 0;
                        for (let i = 0; i < upper.length; i++) {
                            const current = romanValues[upper[i]];
                            const next = romanValues[upper[i + 1]];
                            if (next && current < next) {
                                val -= current;
                            } else {
                                val += current;
                            }
                        }
                        if (val > 0) {
                            product *= val;
                            foundAny = true;
                        }
                    }
                }
                return foundAny && product === 35;
            }
        },
        {
            id: 9,
            text: "A sua palavra-passe deve incluir um símbolo de duas letras da tabela periódica.",
            validator: (pwd) => PERIODIC_TABLE.some(elem => pwd.includes(elem))
        },
        {
            id: 10,
            text: `A sua palavra-passe deve incluir esta cor em hexadecimal: ${targetColor.emoji} ${targetColor.name} (no formato #[6 digitos]) <button class="refresh-btn" onclick="refreshColor()">🔄</button>`,
            validator: (pwd) => pwd.toLowerCase().includes(targetColor.hex.toLowerCase())
        },
         {
            id: 11,
            text: "🥚 Este é o meu frango Pipo. Ele ainda não nasceu. Por favor, coloque-o na sua palavra-passe e mantenha-o em segurança.",
            validator: (pwd) => pwd.includes("🥚") || pwd.includes("🐣") || pwd.includes("🐥")
        },
        {
            id: 12,
            text: `A sua palavra-passe deve incluir este CAPTCHA: <strong>${currentCaptcha}</strong> <button class="refresh-btn" onclick="refreshCaptcha()">🔄</button>`,
            validator: (pwd) => pwd.includes(currentCaptcha)
        },
        {
            id: 13,
            text: `A sua palavra-passe deve incluir um dos nossos patrocinadores: <div class="sponsors-list">${SPONSORS.map(s => `<img src="${s.image}" title="${s.name}" class="sponsor-img">`).join('')}</div>`,
            validator: (pwd) => SPONSORS.some(s => pwd.toLowerCase().includes(s.name.toLowerCase()))
        },
        {
            id: 14,
            text: "A sua palavra-passe deve incluir um ano bissexto (entre 1988 e 2060).",
            validator: (pwd) => {
                const leapYears = [1988, 1992, 1996, 2000, 2004, 2008, 2012, 2016, 2020, 2024, 2028, 2032, 2036, 2040, 2044, 2048, 2052, 2056, 2060];
                return leapYears.some(year => pwd.includes(year.toString()));
            }
        },
        {
            id: 15,
            text: "A sua palavra-chave deve conter uma das seguintes afirmações: 'Eu sou forte', 'Eu supero' ou 'Eu aguento'.",
            validator: (pwd) => {
                const affirmations = ["Eu sou forte", "Eu supero", "Eu aguento"];
                return affirmations.some(aff => pwd.toLowerCase().includes(aff.toLowerCase()));
            }
        },
        {
            id: 16,
            text: "O comprimento da sua palavra-passe deve ser um número primo.",
            validator: (pwd) => {
                const n = pwd.length;
                if (n <= 1) return false;
                if (n <= 3) return true;
                if (n % 2 === 0 || n % 3 === 0) return false;
                for (let i = 5; i * i <= n; i += 6) {
                    if (n % i === 0 || n % (i + 2) === 0) return false;
                }
                return true;
            }
        },
       
        {
            id: 17,
            text: "O Pipo nasceu! 🐣 Ele tem fome. Dê-lhe de comer uma espiga 🌾.",
            validator: (pwd) => (pwd.includes("🐣") && pwd.includes("🌾")) || pwd.includes("🐥")
        },
        {
            id: 18,
            text: `A sua palavra-passe deve incluir a solução (por extenso) para o zero desta função: <img src="equation.svg" class="equation-img">`,
            validator: (pwd) => pwd.toLowerCase().includes("sete")
        }
    ];
}

// --- Gestão de Estado e UI ---

let activeRuleIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    initGameData();
    setupNavigation();
    setupPasswordGame();
    setupDashboard();
});

function setupNavigation() {
    const loginBtn = document.getElementById('btn-login-attempt');
    const createAccountLink = document.getElementById('link-create-account');
    const logoutBtn = document.getElementById('btn-logout');

    loginBtn.addEventListener('click', () => {
        alert("Utilizador ou palavra-passe incorretos. (Dica: Tente criar uma conta!)");
    });

    createAccountLink.addEventListener('click', (e) => {
        e.preventDefault();
        switchScreen('register-screen');
        renderRules();
    });

    logoutBtn.addEventListener('click', () => {
        switchScreen('login-screen');
        // Reset game state optionally
    });
}

function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// --- Lógica do Jogo ---

function setupPasswordGame() {
    const input = document.getElementById('password-input');
    const registerBtn = document.getElementById('btn-register');

    input.addEventListener('input', (e) => {
        const pwd = e.target.value;
        document.getElementById('char-count').textContent = pwd.length;
        validateRules(pwd);
    });

    registerBtn.addEventListener('click', () => {
        alert("Conta criada com sucesso! A redirecionar...");
        setTimeout(() => {
            switchScreen('dashboard-screen');
        }, 1000);
    });
}

function renderRules() {
    const container = document.getElementById('rules-container');
    container.innerHTML = '';
    // Inicialmente mostra apenas a primeira regra
    addRuleToUI(rules[0], 0);
}

function addRuleToUI(rule, index) {
    const container = document.getElementById('rules-container');
    if (document.getElementById(`rule-${index}`)) return; // Já existe

    const div = document.createElement('div');
    div.id = `rule-${index}`;
    div.className = 'rule failed';
    div.innerHTML = `
        <div class="rule-header">
            <span>Regra ${rule.id}</span>
            <span class="icon">❌</span>
        </div>
        <div class="rule-desc">${rule.text}</div>
    `;
    // Inserir no topo (como no jogo original) ou no fundo? No original as novas aparecem em cima.
    container.insertBefore(div, container.firstChild);
}

function updateRuleStatus(ruleEl, passed) {
    if (passed) {
        ruleEl.classList.remove('failed');
        ruleEl.classList.add('passed');
        ruleEl.querySelector('.icon').textContent = '✅';
    } else {
        ruleEl.classList.remove('passed');
        ruleEl.classList.add('failed');
        ruleEl.querySelector('.icon').textContent = '❌';
    }
}

function validateRules(pwd) {
    // --- Lógica de Evolução do Pipo ---
    let newPwd = pwd;
    let changed = false;

    // 1. Nascer (Hatching)
    // O Pipo nasce quando todas as regras anteriores à regra de alimentação (Regra 17) forem cumpridas.
    // Ou seja, as regras 1 a 16 devem estar válidas.
    
    const rulesBeforeBirth = rules.slice(0, 16); // Índices 0 a 15 (Regras 1 a 16)
    const readyToHatch = rulesBeforeBirth.every(r => r.validator(pwd));

    if (readyToHatch && pwd.includes("🥚")) {
        newPwd = pwd.replace(/🥚/g, "🐣");
        changed = true;
    }

    // 2. Comer (Feeding)
    // Se tem pinto E espiga -> vira frango (e remove espiga)
    if (pwd.includes("🐣") && pwd.includes("🌾")) {
        newPwd = pwd.replace(/🐣/g, "🐥").replace(/🌾/g, "");
        changed = true;
    }

    if (changed) {
        const input = document.getElementById('password-input');
        input.value = newPwd;
        document.getElementById('char-count').textContent = newPwd.length;
        // Validar novamente com o novo valor
        validateRules(newPwd);
        return;
    }

    let allPassed = true;
    
    // Iterar sobre as regras para determinar quais mostrar e validar
    for (let i = 0; i < rules.length; i++) {
        const rule = rules[i];
        const passed = rule.validator(pwd);
        
        // Verificar se a regra já está visível
        let ruleEl = document.getElementById(`rule-${i}`);
        
        if (ruleEl) {
            // Se já está visível, atualizamos o estado
            updateRuleStatus(ruleEl, passed);
            if (!passed) allPassed = false;
        } else {
            // Se não está visível, verificamos se devemos mostrar
            // Só mostramos a regra N se a regra N-1 estiver visível E tiver passado
            // A regra 0 é sempre mostrada (tratada no renderRules inicial)
            
            if (i > 0) {
                const prevRuleEl = document.getElementById(`rule-${i-1}`);
                // Se a anterior existe e passou, mostramos esta
                if (prevRuleEl && prevRuleEl.classList.contains('passed')) {
                    addRuleToUI(rule, i);
                    // Validamos imediatamente a nova regra
                    const newRuleEl = document.getElementById(`rule-${i}`);
                    updateRuleStatus(newRuleEl, passed);
                    if (!passed) allPassed = false;
                } else {
                    // Se a anterior não passou ou não existe, paramos de adicionar novas regras
                    // E marcamos como incompleto porque ainda há regras por descobrir
                    allPassed = false;
                    // Não precisamos de continuar o loop para adicionar regras, 
                    // mas precisamos de continuar para garantir que regras futuras (se existissem por erro) não afetem?
                    // Na verdade, podemos parar de adicionar, mas as regras JÁ visíveis devem ser atualizadas.
                    // Como o loop itera por ordem, e nós só adicionamos se a anterior passou, 
                    // as regras futuras não estarão visíveis.
                }
            }
        }
    }

    // Verificação final para o botão
    // O botão só ativa se TODAS as regras passarem na validação atual
    // E se a última regra já tiver sido revelada (para garantir que o jogo chegou ao fim)
    const allRulesValid = rules.every(r => r.validator(pwd));
    const lastRuleVisible = document.getElementById(`rule-${rules.length - 1}`) !== null;
    
    document.getElementById('btn-register').disabled = !(allRulesValid && lastRuleVisible);
}

// --- Lógica dos Presentes ---

function setupDashboard() {
    document.querySelectorAll('.btn-unlock').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            const container = document.getElementById(`gift-${id}`);
            const input = container.querySelector('.code-input');
            const code = input.value.trim();
            
            if (GIFTS[id] && code === GIFTS[id].unlockCode) {
                // Sucesso
                container.querySelector('.status').textContent = "Desbloqueado!";
                container.querySelector('.status').style.color = "var(--secondary-color)";
                container.querySelector('.unlock-area').classList.add('hidden');
                container.querySelector('.lock-code').classList.remove('hidden');
                container.querySelector('.big-code').textContent = GIFTS[id].lockCombo;
            } else {
                // Erro
                alert("Código incorreto! Tente novamente.");
                input.value = '';
            }
        });
    });
}
