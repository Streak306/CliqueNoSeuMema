# Especificação de gameplay e cálculo

Documenta fórmulas, desbloqueios e ícones para o jogo de cliques. Todas as quantias usam a notação `MpS` (Meminhas por segundo) e `MpC` (Meminhas por clique).

## 0) Convenções gerais

- `MpS` = produção global por segundo.
- `MpC` = produção por clique.
- Para cada prédio **X**:
  - `baseCostX` = custo base.
  - `costX(n) = ceil(baseCostX * 1.15^n)` em que `n` é a quantidade já comprada.
  - `baseMpsX` = produção base por unidade.
  - `uX` = upgrades de eficiência comprados.
  - `multX = 2^uX`.
  - `mpsX = qtdX * baseMpsX * multX`.
- MpS total (antes de troféus, cliques e outros multiplicadores globais) é a soma de todos os prédios:

  ```js
  mpsFromBuildings =
      mpsDedos
    + mpsRoupas
    + mpsAgua
    + mpsJardim
    + mpsCriadouro
    + mpsMineracao
    + mpsGerador
    + mpsEstudio
    + mpsNamorada
    + ... // prédios futuros
  ```
- Após a soma, aplicam-se multiplicadores globais (troféus e afins).

## 1) Upgrades de click com tags (15)

### Regra global do clique

- `q` = número de upgrades de click comprados.
- Percentual do MpS que entra no clique:

  ```js
  clickPctOfMps = 0.01 * q;
  ```
- Componente derivado do MpS no clique:

  ```js
  mpcFromMps = MpS * clickPctOfMps;
  ```
- MpC final:

  ```js
  MpC_total = mpcBase + mpcFromMps;
  ```

### Lista de upgrades de click

Cada upgrade concede **+1% do MpS atual no MpC** e traz uma `tag` de UI.

| # | Nome | Tag | Unlock (Meminhas por clique) | Preço |
|---|------|-----|------------------------------|-------|
| 1 | Click | Normal | 1 000 cliques | 50 000 |
| 2 | Click de pedra | Pedra | 100 000 | 5 000 000 |
| 3 | Click de Carvão | Carvão | 10 000 000 | 500 000 000 |
| 4 | Click de Cobre | Cobre | 1 000 000 000 | 50 000 000 000 |
| 5 | Click de Ferro | Ferro | 100 000 000 000 | 5 000 000 000 000 |
| 6 | Click de Bronze | Bronze | 10 000 000 000 000 | 500 000 000 000 000 |
| 7 | Click de Prata | Prata | 1 000 000 000 000 000 | 50 000 000 000 000 000 |
| 8 | Click de Ouro | Ouro | 100 000 000 000 000 000 | 5 000 000 000 000 000 000 |
| 9 | Click de Titânio | Titânio | 10 000 000 000 000 000 000 | 500 000 000 000 000 000 000 |
| 10 | Click de Urânio | Urânio | 1 000 000 000 000 000 000 000 | 50 000 000 000 000 000 000 000 |
| 11 | Click de Rubi | Rubi | 100 000 000 000 000 000 000 000 | 5 000 000 000 000 000 000 000 000 |
| 12 | Click de Esmeralda | Esmeralda | 10 000 000 000 000 000 000 000 000 | 500 000 000 000 000 000 000 000 000 |
| 13 | Click de Safira | Safira | 1 000 000 000 000 000 000 000 000 000 | 50 000 000 000 000 000 000 000 000 00 |
| 14 | Click de Ametista | Ametista | 100 000 000 000 000 000 000 000 000 000 | 5 000 000 000 000 000 000 000 000 000 000 |
| 15 | Click de Diamante | Diamante | 10 000 000 000 000 000 000 000 000 000 000 | 500 000 000 000 000 000 000 000 000 000 000 |

## 2) Conquistas de Click

Desbloqueiam por **meminhas obtidas clicando** (não MpS):

1. 1 000 → "Clicado"
2. 100 000 → "Mouse de aço"
3. 10 000 000 → "Auto click é errado heimm"
4. 1 000 000 000 → "Que dedinho bom o seu hihihi"
5. 100 000 000 000 → "Tendinite"
6. 10 000 000 000 000 → "Clicando the fato"
7. 1 000 000 000 000 000 → "click click click"
8. 100 000 000 000 000 000 → "Sou o priprio auto click"
9. 10 000 000 000 000 000 000 → "Cataclicksmo"
10. 1 000 000 000 000 000 000 000 → "Vou clicleouquecer..."
11. 100 000 000 000 000 000 000 000 → "Ninguém Clica como eu"
12. 10 000 000 000 000 000 000 000 000 → "Perdi o emprego"
13. 1 000 000 000 000 000 000 000 000 000 000 → "Minha profissão virou essa."
14. 100 000 000 000 000 000 000 000 000 000 000 → "Clique perfeito"
15. 10 000 000 000 000 000 000 000 000 000 000 000 → "Tem algo que não seja clicar nesse mundo"

## 3) Building “Dedos” (Fingers)

- Produção base: **0.1 MpS** por unidade.
- Variáveis:
  - `C` = número de Dedos.
  - `k` = upgrades de eficiência ×2 (Dedão, Pedra, Carvão) comprados.
  - `B` = total de prédios **não-Dedo** (soma das quantidades de todos os outros buildings).
  - `M` = multiplicador do bônus “fingers”; inicia em 0 e é ativado por Dedo de Cobre.
- Eficiência base:

  ```js
  E = 2 ** k;
  ```
- Bônus “fingers”: se não houver Dedo de Cobre, `bonusPorDedo = 0`; caso contrário:

  ```js
  bonusPorDedo = 0.1 * B * M;
  ```
- Evolução de `M` conforme upgrades: Cobre → `M = 1`; Ferro → `M *= 5`; Bronze → `M *= 10`; Prata → `M *= 20`; Ouro/Titânio/Urânio/Rubi/Esmeralda/Safira/Ametista/Diamante → cada um `M *= 20`.
- Fórmula final:

  ```js
  MpS_dedos = C * E * (0.1 + bonusPorDedo);
  ```

### Upgrades de Dedos (todos com `tag`)

1. Dedão — "Normal" — unlock: 1 Dedo — preço: 100 — efeito: `k++`.
2. Dedo de pedra — "Pedra" — unlock: 1 — 500 — efeito: `k++`.
3. Dedo de Carvão — "Carvão" — unlock: 10 — 10 000 — efeito: `k++`.
4. Dedo de Cobre — "Cobre" — unlock: 25 — 100 000 — efeito: `M = max(M, 1)`.
5. Dedo de Ferro — "Ferro" — unlock: 50 — 10 000 000 — efeito: `M *= 5`.
6. Dedo de Bronze — "Bronze" — 100 — 100 000 000 — `M *= 10`.
7. Dedo de Prata — "Prata" — 150 — 1 000 000 000 — `M *= 20`.
8. Dedo de Ouro — "Ouro" — 200 — 10 000 000 000 — `M *= 20`.
9. Dedo de Titânio — "Titânio" — 250 — 10 000 000 000 000 — `M *= 20`.
10. Dedo de Urânio — "Urânio" — 300 — 10 000 000 000 000 000 — `M *= 20`.
11. Dedo de Rubi — "Rubi" — 350 — 10 000 000 000 000 000 000 — `M *= 20`.
12. Dedo de Esmeralda — "Esmeralda" — 400 — 10 000 000 000 000 000 000 000 — `M *= 20`.
13. Dedo de Safira — "Safira" — 450 — 10 000 000 000 000 000 000 000 000 — `M *= 20`.
14. Dedo de Ametista — "Ametista" — 500 — 10 000 000 000 000 000 000 000 000 000 — `M *= 20`.
15. Dedo de Diamante — "Diamante" — 550 — 10 000 000 000 000 000 000 000 000 000 000 — `M *= 20`.

### Conquistas de Dedos

Quantidades de Dedos: 1, 5, 25, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600 (nomes conforme lista original).

## 4) Building “Roupa” (Grandma equivalente)

- Singular: "Roupa"; plural: "Roupas".
- `baseCostRoupa = 100`; `costRoupa(n) = ceil(100 * 1.15^n)`; `baseMpsRoupa = 1`.
- MpS:

  ```js
  R = qtdRoupas;
  uRoupa = upgradesRoupaComprados;
  multRoupas = 2 ** uRoupa;
  mpsRoupas = R * baseMpsRoupa * multRoupas;
  ```

### Upgrades de Roupas (dobram `multRoupas`)

1. Cabide — "Normal" — 1 Roupa — 1 000
2. Capacete — "Pedra" — 5 — 5 000
3. Broche — "Carvão" — 25 — 50 000
4. Colar — "Cobre" — 50 — 5 000 000
5. Pulseira — "Ferro" — 100 — 500 000 000
6. Medalha de primeiro lugar — "Bronze" — 150 — 50 000 000 000
7. Piercing de lua — "Prata" — 200 — 50 000 000 000 000
8. Coroa — "Ouro" — 250 — 50 000 000 000 000 000
9. Peitoral — "Titânio" — 300 — 50 000 000 000 000 000 000
10. Mascara de radiação — "Urânio" — 350 — 50 000 000 000 000 000 000 000
11. Brinco de Rubi — "Rubi" — 400 — 500 000 000 000 000 000 000 000 000
12. Colar de Esmeralda — "Esmeralda" — 450 — 5 000 000 000 000 000 000 000 000 000
13. Brinco de Safira — "Safira" — 500 — 50 000 000 000 000 000 000 000 000 000 000
14. Revestimento magico de coração — "Ametista" — 550 — 500 000 000 000 000 000 000 000 000 000 000 000
15. Anel de casamento — "Diamante" — 600 — 5 000 000 000 000 000 000 000 000 000 000 000 000 000

### Conquistas de Roupas

Mesmas quantidades: 1, 5, 25, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600.

## 5) Building “Água” (Farm equivalente)

- `baseCostAgua = 1100`; `costAgua(n) = ceil(1100 * 1.15^n)`; `baseMpsAgua = 8`.
- MpS:

  ```js
  A = qtdAgua;
  uAgua = upgradesAgua;
  multAgua = 2 ** uAgua;
  mpsAgua = A * baseMpsAgua * multAgua;
  ```

### Upgrades de Água (dobram `multAgua`)

1. Garrafa da agua — "Normal" — 1 — 11 000
2. Agua de rios e pedras — "Pedra" — 5 — 55 000
3. Caldeirão de purificar agua — "Carvão" — 25 — 550 000
4. Encanamento de Cobre — "Cobre" — 50 — 55 000 000
5. caixa d'agua — "Ferro" — 100 — 5 500 000 000
6. pote de Bronzze — "Bronze" — 150 — 550 000 000 000
7. Lagrima lunar — "Prata" — 200 — 550 000 000 000 000
8. Agua real — "Ouro" — 250 — 550 000 000 000 000 000
9. Energia movida a agua — "Titânio" — 300 — 550 000 000 000 000 000 000
10. Agua radioativa — "Urânio" — 350 — 550 000 000 000 000 000 000 000
11. Agua de sangue humano — "Rubi" — 400 — 5 500 000 000 000 000 000 000 000 000
12. Agua tirada da vida das plantas — "Esmeralda" — 450 — 55 000 000 000 000 000 000 000 000 000 000
13. Bolhas de Agua — "Safira" — 500 — 550 000 000 000 000 000 000 000 000 000 000 000
14. Slime de agua magico — "Ametista" — 550 — 5 500 000 000 000 000 000 000 000 000 000 000 000
15. Tranformador de Luz em Agua — "Diamante" — 600 — 55 000 000 000 000 000 000 000 000 000 000 000 000 000

### Conquistas de Água

Quantidades: 1, 5, 25, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600 (nomes conforme lista original: Garrafa 250 ml, Poça, Caixa d’água, …, Água total da Terra).

## 6) Building “Jardim”

- `baseCostJardim = 12 000`; `costJardim(n) = ceil(12 000 * 1.15^n)`; `baseMpsJardim = 47`.
- MpS:

  ```js
  J = qtdJardins;
  uJardim = upgradesJardim;
  multJardim = 2 ** uJardim;
  mpsJardim = J * baseMpsJardim * multJardim;
  ```

### Upgrades de Jardim (dobram `multJardim`)

1. Fertilizante — "Normal" — 1 — 120 000
2. Arador de Pedra — "Pedra" — 5 — 600 000
3. Churrasco — "Carvão" — 25 — 6 000 000
4. Aspersor de cobre — "Cobre" — 50 — 600 000 000
5. Foice — "Ferro" — 100 — 60 000 000 000
6. Sino — "Bronze" — 150 — 6 000 000 000 000
7. Lâmpada de energia lunar — "Prata" — 200 — 6 000 000 000 000 000
8. Espantalho real do rei bigode — "Ouro" — 250 — 6 000 000 000 000 000 000
9. Drone irrigador e coletador — "Titânio" — 300 — 6 000 000 000 000 000 000 000
10. Fertilizante duvidoso — "Urânio" — 350 — 6 000 000 000 000 000 000 000 000
11. Totem de Outono — "Rubi" — 400 — 60 000 000 000 000 000 000 000 000 000
12. Totem da Primavera — "Esmeralda" — 450 — 600 000 000 000 000 000 000 000 000 000 000
13. Totem do Inverno — "Safira" — 500 — 6 000 000 000 000 000 000 000 000 000 000 000
14. Totem do Verão — "Ametista" — 550 — 60 000 000 000 000 000 000 000 000 000 000 000 000
15. Totem de todas as estações — "Diamante" — 600 — 600 000 000 000 000 000 000 000 000 000 000 000 000 000

### Conquistas de Jardim

Quantidades: 1, 5, 25, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600.

## 7) Building “Criadouro”

- `baseCostCriadouro = 130 000`; `costCriadouro(n) = ceil(130 000 * 1.15^n)`; `baseMpsCriadouro = 260`.
- MpS:

  ```js
  F = qtdCriadouros;
  uCriadouro = upgradesCriadouro;
  multCriadouro = 2 ** uCriadouro;
  mpsCriadouro = F * baseMpsCriadouro * multCriadouro;
  ```

### Upgrades de Criadouro (dobram `multCriadouro`)

1. Palha — "Normal" — 1 — 1 300 000
2. Tijela — "Pedra" — 5 — 6 500 000
3. Aquecedor — "Carvão" — 25 — 65 000 000
4. mangueira — "Cobre" — 50 — 6 500 000 000
5. Portão — "Ferro" — 100 — 650 000 000 000
6. Chocadeira — "Bronze" — 150 — 65 000 000 000 000
7. kit medico lunar — "Prata" — 200 — 65 000 000 000 000 000
8. ração automatizada — "Ouro" — 250 — 6 500 000 000 000 000 000
9. Cuidador de animais — "Titânio" — 300 — 65 000 000 000 000 000 000 000
10. Animais evoluidos — "Urânio" — 350 — 65 000 000 000 000 000 000 000 000
11. Cama quente — "Rubi" — 400 — 65 000 000 000 000 000 000 000 000 000
12. Arvores abençoadas — "Esmeralda" — 450 — 650 000 000 000 000 000 000 000 000 000 000
13. Água infinita para animais — "Safira" — 500 — 65 000 000 000 000 000 000 000 000 000 000 000 000
14. Comida magica que cura e fortalece — "Ametista" — 550 — 650 000 000 000 000 000 000 000 000 000 000 000 000 000
15. Clonador — "Diamante" — 600 — 65 000 000 000 000 000 000 000 000 000 000 000 000 000 000

### Conquistas de Criadouro

Quantidades: 1, 5, 25, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600.

## 8) Building “Mineração”

- `baseCostMineracao = 1 400 000`; `costMineracao(n) = ceil(1 400 000 * 1.15^n)`; `baseMpsMineracao = 1 400`.
- MpS:

  ```js
  M = qtdMineracoes;
  uMineracao = upgradesMineracao;
  multMineracao = 2 ** uMineracao;
  mpsMineracao = M * baseMpsMineracao * multMineracao;
  ```

### Upgrades de Mineração (dobram `multMineracao`)

1. Picareta de madeira — "Normal" — 1 — 14 000 000
2. Picareta antiga — "Pedra" — 5 — 70 000 000
3. Carrinho de carvão — "Carvão" — 25 — 700 000 000
4. Luzes de fio de cobre — "Cobre" — 50 — 70 000 000 000
5. Marreta e pá — "Ferro" — 100 — 7 000 000 000 000
6. Capacete com lanterna — "Bronze" — 150 — 700 000 000 000 000
7. Bússola — "Prata" — 200 — 70 000 000 000 000 000
8. Mapa real — "Ouro" — 250 — 7 000 000 000 000 000 000
9. Broca — "Titânio" — 300 — 700 000 000 000 000 000 000
10. Laser de perfuração — "Urânio" — 350 — 70 000 000 000 000 000 000 000
11. Luva que aguenta qualquer temperatura — "Rubi" — 400 — 7 000 000 000 000 000 000 000 000
12. Lanterna de minérios raros — "Esmeralda" — 450 — 700 000 000 000 000 000 000 000 000
13. Relíquia dos oceanos profundos — "Safira" — 500 — 70 000 000 000 000 000 000 000 000 000
14. Portal do mundo dos minérios — "Ametista" — 550 — 7 000 000 000 000 000 000 000 000 000 000
15. Minerador automático — "Diamante" — 600 — 700 000 000 000 000 000 000 000 000 000

### Conquistas de Mineração

Quantidades: 1, 5, 25, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600.

## 9) Building “Gerador de Energia” (Wizard tower equivalente)

- `baseCostGerador = 330 000 000`; `costGerador(n) = ceil(330 000 000 * 1.15^n)`; `baseMpsGerador = 44 000`.
- MpS:

  ```js
  G = qtdGeradores;
  uGerador = upgradesGerador;
  multGerador = 2 ** uGerador;
  mpsGerador = G * baseMpsGerador * multGerador;
  ```

### Upgrades de Gerador (dobram `multGerador`)

1. Pistão — "Normal" — 1 — 3 300 000 000
2. Engrenagem — "Pedra" — 5 — 16 500 000 000
3. Energia a carvão — "Carvão" — 25 — 165 000 000 000
4. Fio de Cobre — "Cobre" — 50 — 1 650 000 000 000
5. Motor estacionário antigo — "Ferro" — 100 — 165 000 000 000 000
6. Energia a vapor — "Bronze" — 150 — 165 000 000 000 000 000
7. Painel Lunar — "Prata" — 200 — 16 500 000 000 000 000 000
8. Gerador de energia a partir da fé — "Ouro" — 250 — 1 650 000 000 000 000 000 000
9. Hélice — "Titânio" — 300 — 165 000 000 000 000 000 000 000
10. Energia nuclear — "Urânio" — 350 — 16 500 000 000 000 000 000 000 00
11. Energia do calor — "Rubi" — 400 — 1 650 000 000 000 000 000 000 000 000
12. Energia vital — "Esmeralda" — 450 — 165 000 000 000 000 000 000 000 000 000
13. Gerador hídrico — "Safira" — 500 — 16 500 000 000 000 000 000 000 000 000 00
14. Energia arcana — "Ametista" — 550 — 1 650 000 000 000 000 000 000 000 000 000 000
15. Buraco Branco — "Diamante" — 600 — 165 000 000 000 000 000 000 000 000 000 000 00

### Conquistas de Gerador

Quantidades: 1, 5, 25, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600.

## 10) Building “Estúdio de música”

- `baseCostEstudio = 5 100 000 000`; `costEstudio(n) = ceil(5 100 000 000 * 1.15^n)`; `baseMpsEstudio = 260 000`.
- MpS:

  ```js
  E = qtdEstudios;
  uEstudio = upgradesEstudio;
  multEstudio = 2 ** uEstudio;
  mpsEstudio = E * baseMpsEstudio * multEstudio;
  ```

### Upgrades de Estúdio (dobram `multEstudio`)

1. Microfone velho — "Normal" — 1 — 51 000 000 000
2. Bateria de pedra — "Pedra" — 5 — 255 000 000 000
3. Caixa de música suja — "Carvão" — 25 — 2 550 000 000 000
4. Megafone — "Cobre" — 50 — 255 000 000 000 000
5. Mesa de instrumentos — "Ferro" — 100 — 25 500 000 000 000 000
6. Bateria — "Bronze" — 150 — 2 550 000 000 000 000 000
7. Microfone profissional — "Prata" — 200 — 255 000 000 000 000 000 000
8. Edição de áudio — "Ouro" — 250 — 25 500 000 000 000 000 000 00
9. Visualização de áudio futurista — "Titânio" — 300 — 2 550 000 000 000 000 000 000 000
10. Som energético — "Urânio" — 350 — 255 000 000 000 000 000 000 000 000
11. Piano térmico — "Rubi" — 400 — 25 500 000 000 000 000 000 000 000 00
12. Planta cantora — "Esmeralda" — 450 — 2 550 000 000 000 000 000 000 000 000 0
13. Caixa de Slowed + Reverb — "Safira" — 500 — 255 000 000 000 000 000 000 000 000 000 000
14. Sons mágicos — "Ametista" — 550 — 25 500 000 000 000 000 000 000 000 000 000 00
15. A música pode ser sentida pelos 5 sentidos — "Diamante" — 600 — 2 550 000 000 000 000 000 000 000 000 000 000 000

### Conquistas de Estúdio de música

Quantidades: 1, 5, 25, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600.

## 11) Building “Namorada”

- `baseCostNamorada = 75 000 000 000`; `costNamorada(n) = ceil(75 000 000 000 * 1.15^n)`; `baseMpsNamorada = 1 600 000`.
- MpS:

  ```js
  N = qtdNamoradas;
  uNamorada = upgradesNamorada;
  multNamorada = 2 ** uNamorada;
  mpsNamorada = N * baseMpsNamorada * multNamorada;
  ```

### Upgrades de Namorada (dobram `multNamorada`)

1. Coração Vazio — "Normal" — 1 — 750 000 000 000
2. Coração de Pedra — "Pedra" — 5 — 3 750 000 000 000
3. Coração de Carvão — "Carvão" — 25 — 37 500 000 000 000
4. Coração de Cobre — "Cobre" — 50 — 3 750 000 000 000 000
5. Coração de Ferro — "Ferro" — 100 — 375 000 000 000 000 000
6. Coração de Bronze — "Bronze" — 150 — 37 500 000 000 000 000 00
7. Coração de Prata — "Prata" — 200 — 3 750 000 000 000 000 000 000
8. Coração de Ouro — "Ouro" — 250 — 375 000 000 000 000 000 000 000
9. Coração de Titânio — "Titânio" — 300 — 37 500 000 000 000 000 000 000 00
10. Coração de Urânio — "Urânio" — 350 — 3 750 000 000 000 000 000 000 000 000
11. Coração de Rubi — "Rubi" — 400 — 375 000 000 000 000 000 000 000 000 00
12. Coração de Esmeralda — "Esmeralda" — 450 — 37 500 000 000 000 000 000 000 000 000 00
13. Coração de Safira — "Safira" — 500 — 3 750 000 000 000 000 000 000 000 000 000 0
14. Coração de Ametista — "Ametista" — 550 — 375 000 000 000 000 000 000 000 000 000 000 0
15. Coração de Diamante — "Diamante" — 600 — 37 500 000 000 000 000 000 000 000 000 000 00

### Conquistas de Namorada

Quantidades: 1, 5, 25, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600 (nomes: Me perdoe..., Morango do amor, …, Fim.).

## 12) Troféus (substituem Kittens/Milk)

Upgrades globais que aumentam MpS e MpC conforme progresso em conquistas.

- `achievementsOwned` = conquistas obtidas; `achievementsTotal` = total disponível; `completionRatio = achievementsOwned / achievementsTotal`.
- Para cada troféu comprado, existe `trophyFactor`.
- Multiplicador global:

  ```js
  sumTrophyFactor = soma de trophyFactor dos troféus comprados;
  trophyMultiplier = 1 + completionRatio * sumTrophyFactor;

  MpS_final = MpS_from_all_sources * trophyMultiplier;
  MpC_final = MpC_from_all_sources * trophyMultiplier;
  ```

### Tags

Tags de UI: Normal, Pedra, Carvão, Cobre, Ferro, Bronze, Prata, Ouro, Titânio, Urânio, Rubi, Esmeralda, Safira, Ametista, Diamante.

### Lista de troféus (unlock por conquistas)

| # | Nome | Tag | Achievements ≥ | Preço | `trophyFactor` |
|---|------|-----|----------------|-------|----------------|
| 1 | Troféu antigo | Normal | 13 | 9 000 000 | 0.10 |
| 2 | Troféu de Pedra | Pedra | 25 | 9 000 000 000 | 0.125 |
| 3 | Troféu de Carvão | Carvão | 50 | 90 000 000 000 000 | 0.15 |
| 4 | Troféu de Cobre | Cobre | 75 | 90 000 000 000 000 000 | 0.175 |
| 5 | Troféu de Ferro | Ferro | 100 | 900 000 000 000 000 000 000 | 0.20 |
| 6 | Troféu de Bronze | Bronze | 125 | 900 000 000 000 000 000 000 000 | 0.20 |
| 7 | Troféu de Prata | Prata | 150 | 900 000 000 000 000 000 000 000 000 | 0.20 |
| 8 | Troféu de Ouro | Ouro | 175 | 900 000 000 000 000 000 000 000 000 000 | 0.20 |
| 9 | Troféu de Titânio | Titânio | 200 | 900 000 000 000 000 000 000 000 000 000 000 | 0.20 |
| 10 | Troféu de Urânio | Urânio | 225 | 900 000 000 000 000 000 000 000 000 000 000 000 | 0.175 |
| 11 | Troféu de Rubi | Rubi | 250 | 900 000 000 000 000 000 000 000 000 000 000 000 000 | 0.15 |
| 12 | Troféu de Esmeralda | Esmeralda | 275 | 900 000 000 000 000 000 000 000 000 000 000 000 000 000 | 0.125 |
| 13 | Troféu de Safira | Safira | 300 | 900 000 000 000 000 000 000 000 000 000 000 000 000 000 000 | 0.115 |
| 14 | Troféu de Ametista | Ametista | 325 | 900 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 | 0.11 |
| 15 | Troféu de Diamante | Diamante | 350 | 900 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 | 0.105 |

## 13) Ordem recomendada de cálculo

1. Atualizar quantidades de prédios, upgrades, conquistas e troféus.
2. Calcular `multX = 2^uX` de cada prédio.
3. Calcular MpS individual de cada prédio (Dedos com `E`, `B`, `M`; demais com base * quantidade * multiplicador).
4. Somar em `MpS_from_buildings`.
5. Aplicar outros multiplicadores globais (prestígio, etc.).
6. Calcular `completionRatio`, `sumTrophyFactor` e `trophyMultiplier`.
7. Aplicar multiplicadores globais e `trophyMultiplier`:

   ```js
   MpS = MpS_from_buildings * outrosMultiplicadoresGlobais * trophyMultiplier;
   ```
8. Calcular `clickPctOfMps` pelos upgrades de click.
9. Calcular `MpC`:

   ```js
   MpC = mpcBase + (MpS * clickPctOfMps);
   MpC *= mesmosMultiplicadoresGlobais * trophyMultiplier;
   ```

## 14) Convenção de ícones de upgrades

- Pasta base: `docs/assets/images/Upgrade/`.
- Padrão de arquivos: `up-<tipo>-t<1..15>.png`.
- Tipos: `cursor` (click), `dedo`, `roupa`, `agua`, `Jardim`, `criadouro`, `mineracao`, `energia`, `musica`, `namorada`, `vila`, `trofeu`.
- Índice das tags: t1 Normal; t2 Pedra; t3 Carvão; t4 Cobre; t5 Ferro; t6 Bronze; t7 Prata; t8 Ouro; t9 Titânio; t10 Urânio; t11 Rubi; t12 Esmeralda; t13 Safira; t14 Ametista; t15 Diamante.

## 15) Mapas rápidos (nome → arquivo)

- **Click:** Click → up-cursor-t1.png; Pedra → t2; Carvão → t3; Cobre → t4; Ferro → t5; Bronze → t6; Prata → t7; Ouro → t8; Titânio → t9; Urânio → t10; Rubi → t11; Esmeralda → t12; Safira → t13; Ametista → t14; Diamante → t15.
- **Dedos:** Dedão → up-dedo-t1.png; Dedo de pedra → t2; Dedo de Carvão → t3; Dedo de Cobre → t4; Dedo de Ferro → t5; Dedo de Bronze → t6; Dedo de Prata → t7; Dedo de Ouro → t8; Dedo de Titânio → t9; Dedo de Urânio → t10; Dedo de Rubi → t11; Dedo de Esmeralda → t12; Dedo de Safira → t13; Dedo de Ametista → t14; Dedo de Diamante → t15.
- **Roupas:** Cabide → up-roupa-t1.png; Capacete → t2; Broche → t3; Colar → t4; Pulseira → t5; Medalha de primeiro lugar → t6; Piercing de lua → t7; Coroa → t8; Peitoral → t9; Mascara de radiação → t10; Brinco de Rubi → t11; Colar de Esmeralda → t12; Brinco de Safira → t13; Revestimento magico de coração → t14; Anel de casamento → t15.
- **Água:** Garrafa da agua → up-agua-t1.png; Agua de rios e pedras → t2; Caldeirão de purificar agua → t3; Encanamento de Cobre → t4; caixa d'agua → t5; pote de Bronzze → t6; Lagrima lunar → t7; Agua real → t8; Energia movida a agua → t9; Agua radioativa → t10; Agua de sangue humano → t11; Agua tirada da vida das plantas → t12; Bolhas de Agua → t13; Slime de agua magico → t14; Tranformador de Luz em Agua → t15.
- **Jardim:** Fertilizante → up-Jardim-t1.png; Arador de Pedra → t2; Churrasco → t3; Aspersor de cobre → t4; Foice → t5; Sino → t6; Lâmpada de energia lunar → t7; Espantalho real do rei bigode → t8; Drone irrigador e coletador → t9; Fertilizante duvidoso → t10; Totem de Outono → t11; Totem da Primavera → t12; Totem do Inverno → t13; Totem do Verão → t14; Totem de todas as estações → t15.
- **Criadouro:** Palha → up-criadouro-t1.png; Tijela → t2; Aquecedor → t3; mangueira → t4; Portão → t5; Chocadeira → t6; kit medico lunar → t7; ração automatizada → t8; Cuidador de animais → t9; Animais evoluidos → t10; Cama quente → t11; Arvores abençoadas → t12; Água infinita para animais → t13; Comida magica que cura e fortalece → t14; Clonador → t15.
- **Mineração:** Picareta de madeira → up-mineracao-t1.png; Picareta antiga → t2; Carrinho de carvão → t3; Luzes de fio de cobre → t4; Marreta e pá → t5; Capacete com lanterna → t6; Bússola → t7; Mapa real → t8; Broca → t9; Laser de perfuração → t10; Luva que aguenta qualquer temperatura → t11; Lanterna de minérios raros → t12; Relíquia dos oceanos profundos → t13; Portal do mundo dos minérios → t14; Minerador automático → t15.
- **Gerador de Energia:** Pistão → up-energia-t1.png; Engrenagem → t2; Energia a carvão → t3; Fio de Cobre → t4; Motor estacionário antigo → t5; Energia a vapor → t6; Painel Lunar → t7; Gerador de energia a partir da fé → t8; Hélice → t9; Energia nuclear → t10; Energia do calor → t11; Energia vital → t12; Gerador hídrico → t13; Energia arcana → t14; Buraco Branco → t15.
- **Estúdio de música:** Microfone velho → up-musica-t1.png; Bateria de pedra → t2; Caixa de música suja → t3; Megafone → t4; Mesa de instrumentos → t5; Bateria → t6; Microfone profissional → t7; Edição de áudio → t8; Visualização de áudio futurista → t9; Som energético → t10; Piano térmico → t11; Planta cantora → t12; Caixa de Slowed + Reverb → t13; Sons mágicos → t14; A música pode ser sentida pelos 5 sentidos → t15.
- **Namorada:** Coração Vazio → up-namorada-t1.png; Coração de Pedra → t2; Coração de Carvão → t3; Coração de Cobre → t4; Coração de Ferro → t5; Coração de Bronze → t6; Coração de Prata → t7; Coração de Ouro → t8; Coração de Titânio → t9; Coração de Urânio → t10; Coração de Rubi → t11; Coração de Esmeralda → t12; Coração de Safira → t13; Coração de Ametista → t14; Coração de Diamante → t15.
- **Vila:** Barraca → up-vila-t1.png; Casa de pedra → t2; Chaminé → t3; Sino do prefeito → t4; Portão de Ferro → t5; Presente músical → t6; Lanterna para noite → t7; Prefeitura do bigode → t8; Rede de sinais → t9; Energia nuclear → t10; Benção da vida → t11; Plantações enormes → t12; Exploração marítima → t13; Religião e magia → t14; Utopia → t15.
- **Troféus globais:** Troféu antigo → up-trofeu-t1.png; Troféu de Pedra → t2; Troféu de Carvão → t3; Troféu de Cobre → t4; Troféu de Ferro → t5; Troféu de Bronze → t6; Troféu de Prata → t7; Troféu de Ouro → t8; Troféu de Titânio → t9; Troféu de Urânio → t10; Troféu de Rubi → t11; Troféu de Esmeralda → t12; Troféu de Safira → t13; Troféu de Ametista → t14; Troféu de Diamante → t15.

