# Estação 1 — Terminal Kirlian (Manual)

> Documento específico da Estação 1
> Referência cruzada: Design Base v1.3

---

## Visão Geral

Estação de visão central do sistema. É o ponto de partida e referência de toda a operação. Não executa ações diretas — sua função é conter todas as informações necessárias para que as outras estações saibam o que fazer e quando fazer.

---

## Interface — Tela Principal

- Tela inteira estilo CMD antigo, cor temática verde, fonte monoespaçada
- Canto superior direito: botão clicável **[MANUAL]** — abre o manual · atalho: **Ctrl**
- Canto inferior direito: **cronômetro** (único local diferente das outras estações)
- Canto inferior esquerdo (ao lado do cronômetro): botão **[ENTER]** — acionável por mouse, touch ou teclado

---

## Fluxo da Tela Principal por Estado

### Estado 0 — Tela de Introdução (ao carregar)

Exibido assim que a página carrega. Texto estilo CMD digitando na tela:

```
PROTOCOLO DE EMERGÊNCIA — EXTRAÇÃO DO NÚCLEO KIRLIAN
ВОЕННАЯ БАЗА № 7-42

Uma anomalia de contenção foi detectada na instalação.
O núcleo Kirlian está em risco de ruptura estrutural.

A extração de emergência foi autorizada.
Você tem 15 minutos para concluir todos os procedimentos
e transferir o núcleo para a maleta de transporte segura.

Cada etapa concluída corretamente adiciona 1 minuto ao tempo.
Cada erro cometido remove 30 segundos.

Leia o manual antes de iniciar. Use o botão [MANUAL]
no canto superior direito para acessá-lo a qualquer momento.

─────────────────────────────────────────────────────
Para iniciar, confirme na Estação da Carapaça.
─────────────────────────────────────────────────────
```

> A Estação 5 (Carapaça) envia o sinal de início ao apertar
> seu botão de confirmação — sem necessidade de sequência correta
> neste momento. Ao receber o sinal, a tela avança para o Estado 1.

---

### Estado 1 — Briefing da Tarefa (aguardando ENTER)

Exibido após a Carapaça enviar o sinal de início, ou após
a conclusão de uma tarefa anterior. Mostra o resumo da tarefa atual.

**Tarefa 1 — Calibração de Pressão**
```
> TAREFA 1 — CALIBRAÇÃO DE PRESSÃO

O sistema de contenção detectou instabilidade nos dutos
de pressão que envolvem a carapaça do núcleo Kirlian.

Antes de qualquer tentativa de extração, os dutos precisam
ser calibrados para operar dentro dos parâmetros seguros.
Falhas nesta etapa podem comprometer toda a estrutura
de contenção e colocar a equipe em risco.

Coordene com as demais estações. Consulte o manual.
O Painel de Controle indicará a ordem de execução.

─────────────────────────────────────────────────────
Pressione ENTER para iniciar.
─────────────────────────────────────────────────────
```

**Tarefa 2 — Regulagem de Energia**
```
> TAREFA 2 — REGULAGEM DE ENERGIA      [TAREFA 1: OK]

O campo energético que mantém o núcleo estável está
apresentando variações críticas. Uma sobrecarga ou
queda repentina pode liberar a energia Kirlian de forma
descontrolada. A regulagem deve ser feita com precisão.

Coordene com as demais estações. Consulte o manual.
O Painel de Controle indicará a ordem de execução.

─────────────────────────────────────────────────────
Pressione ENTER para iniciar.
─────────────────────────────────────────────────────
```

**Tarefa 3 — Contenção Paranormal**
```
> TAREFA 3 — CONTENÇÃO PARANORMAL      [T1: OK] [T2: OK]

Leituras anômalas foram detectadas no campo Kirlian.
A energia vital aprisionada no núcleo está reagindo
às etapas anteriores e tentando expandir seu campo
além dos limites da carapaça.

As travas de contenção precisam ser reconfiguradas
para suprimir a expansão. Aja rapidamente.

Coordene com as demais estações. Consulte o manual.
O Painel de Controle indicará a ordem de execução.

─────────────────────────────────────────────────────
Pressione ENTER para iniciar.
─────────────────────────────────────────────────────
```

**Tarefa 4 — Autorização de Extração**
```
> TAREFA 4 — AUTORIZAÇÃO DE EXTRAÇÃO   [T1: OK] [T2: OK] [T3: OK]

Os sistemas de contenção estão quase estabilizados.
Para autorizar a extração física do núcleo, todos os
parâmetros precisam ser verificados e validados.

Coordene com as demais estações. Consulte o manual.
O Painel de Controle indicará a ordem de execução.

─────────────────────────────────────────────────────
Pressione ENTER para iniciar.
─────────────────────────────────────────────────────
```

**Tarefa 5 — Extração Final**
```
> TAREFA 5 — EXTRAÇÃO FINAL   [T1: OK] [T2: OK] [T3: OK] [T4: OK]

Esta é a etapa final.

Todos os sistemas estão calibrados. Todos os cabos de
contenção foram liberados. O núcleo Kirlian está pronto
para ser removido com segurança.

Transfira o núcleo para a maleta de transporte.
Esta é a última ação. Não há retorno.

─────────────────────────────────────────────────────
Pressione ENTER para concluir a extração.
─────────────────────────────────────────────────────
```

> Ao pressionar ENTER:
> — O cronômetro para em todas as estações simultaneamente
> — Todas as estações exibem brilho roxo por 10 segundos
> — A simulação encerra
>
> Se o cronômetro chegar a zero antes do ENTER:
> — O mesmo brilho roxo é acionado em todas as estações
> — A simulação encerra por tempo esgotado

---

### Estado 2 — Tarefa em Andamento (aguardando sinal)

Após pressionar ENTER, a tela exibe o histórico de tarefas
concluídas e uma linha de loading aguardando o próximo evento:

```
[TAREFA 1: OK]
[TAREFA 2: OK]
[TAREFA 3: OK]

> Aguardando conclusão da Tarefa 4...
  ██████░░░░░░░░░░░░░░░░░░░░░░░  [carregando]
```

---

### Estado 3 — Exibição de Símbolos (sobreposição)

Quando a Estação 2 confirma os medidores corretamente,
uma tela de sobreposição aparece **independentemente de onde
o operador estiver** (mesmo que esteja no manual).

A sobreposição exibe as 3 opções de sequência de símbolos
para a Estação 5. Permanece na tela até que a Estação 5
confirme a sequência correta — quando isso acontece,
a sobreposição fecha automaticamente e o Estado 1
é exibido com o briefing da próxima tarefa.
A tarefa anterior aparece como [OK] no histórico da tela principal.

```
╔═══════════════════════════════════════════════════╗
║         SEQUÊNCIAS DE CONTENÇÃO — TAREFA X        ║
║                                                   ║
║   OPÇÃO A:   ○   □   △   ⬡                        ║
║   OPÇÃO B:   ◇   ○   ⊕   □                        ║
║   OPÇÃO C:   ⬡   △   ○   ✕                        ║
║                                                   ║
║   Informe o operador da Carapaça.                 ║
╚═══════════════════════════════════════════════════╝
```

---

## Sequências da Carapaça por Tarefa

Exibidas na sobreposição após a Estação 2 confirmar os medidores.
Apenas uma opção é verdadeira — o operador deve informar as três ao operador da Carapaça.

> Nota interna: os ← VERDADEIRA são apenas referência do arquivo.
> Na tela do jogo as opções aparecem sem marcação — só A, B e C.

---

**Tarefa 1**
```
╔═══════════════════════════════════════════════════╗
║      SEQUÊNCIAS DE CONTENÇÃO — TAREFA 1           ║
║                                                   ║
║  OPÇÃO A:   ⊕   ○   ⊕   □                        ║
║  OPÇÃO B:   ✕   □   △   ⬡                        ║
║  OPÇÃO C:   ⬡   ◇   ○   ✕                        ║
║                                                   ║
║  Informe o operador da Carapaça.                  ║
╚═══════════════════════════════════════════════════╝
```
*(Verdadeira: Opção B)*

---

**Tarefa 2**
```
╔═══════════════════════════════════════════════════╗
║      SEQUÊNCIAS DE CONTENÇÃO — TAREFA 2           ║
║                                                   ║
║  OPÇÃO A:   ○   ⬡   ◇   □                        ║
║  OPÇÃO B:   △   ✕   ✕   ○                        ║
║  OPÇÃO C:   ◇   ⊕   △   ✕                        ║
║                                                   ║
║  Informe o operador da Carapaça.                  ║
╚═══════════════════════════════════════════════════╝
```
*(Verdadeira: Opção A)*

---

**Tarefa 3 — Execução 1**
```
╔═══════════════════════════════════════════════════╗
║      SEQUÊNCIAS DE CONTENÇÃO — TAREFA 3 (I)       ║
║                                                   ║
║  OPÇÃO A:   △   ◇   ○   □                        ║
║  OPÇÃO B:   ○   ✕   ✕   ⬡                        ║
║  OPÇÃO C:   ⬡   ○   ⊕   ◇                        ║
║                                                   ║
║  Informe o operador da Carapaça.                  ║
╚═══════════════════════════════════════════════════╝
```
*(Verdadeira: Opção C)*

---

**Tarefa 3 — Execução 2**
```
╔═══════════════════════════════════════════════════╗
║      SEQUÊNCIAS DE CONTENÇÃO — TAREFA 3 (II)      ║
║                                                   ║
║  OPÇÃO A:   ✕   ⬡   △   △                        ║
║  OPÇÃO B:   ◇   △   ⊕   ○                        ║
║  OPÇÃO C:   □   ⊕   ○   △                        ║
║                                                   ║
║  Informe o operador da Carapaça.                  ║
╚═══════════════════════════════════════════════════╝
```
*(Verdadeira: Opção B)*

---

**Tarefa 4**
```
╔═══════════════════════════════════════════════════╗
║      SEQUÊNCIAS DE CONTENÇÃO — TAREFA 4           ║
║                                                   ║
║  OPÇÃO A:   △   ✕   □   ⬡                        ║
║  OPÇÃO B:   ○   ⬡   ✕   △                        ║
║  OPÇÃO C:   ⊕   □   ⬡   ○                        ║
║                                                   ║
║  Informe o operador da Carapaça.                  ║
╚═══════════════════════════════════════════════════╝
```
*(Verdadeira: Opção A)*

---

## Definições Visuais e de Feedback

**Arte:** terminal CMD antigo, monocromático, cor verde. Fonte monoespaçada.
**Efeito de digitação:** texto aparece como se estivesse sendo digitado em tempo real nas transições.
**Som:** nenhum.
**Cronômetro:** canto inferior direito — nesta estação aparece como texto CMD verde, sem caixa separada.
**Botão ENTER:** canto inferior esquerdo, ao lado do cronômetro.

> Nas Estações 2, 3, 4 e 5 o cronômetro aparece em uma caixa
> flutuante com números vermelhos em contagem regressiva,
> incluindo milésimos de segundo. A caixa não interfere
> com nenhuma interface da estação.

---

## Interface — Manual

Acessado pelo botão **[MANUAL]** na tela principal ou pela tecla **Ctrl**.

**Layout:**
- Tela inteira no mesmo estilo CMD verde
- Título da página centralizado no topo (ao lado do botão de fechar)
- Botão de fechar no canto superior esquerdo — fecha e volta à tela principal. Atalho: **[Esc]**
- Linha verde horizontal separando o conteúdo da barra inferior
- Barra inferior: botões de navegação entre páginas
  - **← [←]** navega para a página anterior
  - **→ [→]** navega para a página seguinte
  - **↑ [↑] ↓ [↓]** scroll do conteúdo (centralizados entre os botões de esquerda e direita)
- Scroll de conteúdo disponível por mouse, touch e teclado

**Páginas do manual (em ordem):**
1. Manual
2. Painel de Controle
3. Válvulas
4. Alavancas
5. Carapaça
6. Falhas Críticas
7. Eventos

---

## Conteúdo do Manual — Página por Página

---

### Página 1 — Manual

```
MANUAL DE OPERAÇÃO — SISTEMA DE CONTENÇÃO KIRLIAN
ВОЕННАЯ БАЗА № 7-42 — PROTOCOLO DE EXTRAÇÃO

Este terminal contém todas as instruções necessárias para conduzir
a extração segura do núcleo Kirlian de sua carapaça de contenção.

O núcleo Kirlian é uma anomalia de energia vital classificada.
Sua remoção exige coordenação precisa entre todas as estações
de controle ativas. Nenhuma estação possui informação suficiente
para operar de forma independente.

Este manual está dividido nas seguintes seções:

  → Painel de Controle  — monitoramento e validação do sistema
  → Válvulas            — controle de pressão dos dutos
  → Alavancas           — regulagem de carga energética
  → Carapaça            — travas de contenção do núcleo
  → Falhas Críticas     — procedimentos de emergência
  → Eventos             — ocorrências imprevistas

Leia com atenção. Comunique-se com sua equipe.
O tempo é limitado e os erros têm consequências.

Boa sorte, operador.
```

---

### Página 2 — Painel de Controle

```
PAINEL DE CONTROLE — ESTAÇÃO DE MONITORAMENTO

O Painel de Controle é responsável por monitorar o estado de todas
as estações em tempo real e por validar cada etapa da operação.

GRADE DE MONITORAMENTO
━━━━━━━━━━━━━━━━━━━━━━
A grade é composta por 25 indicadores luminosos dispostos em
5 linhas e 5 colunas. Cada linha representa uma estação:

  Linha A — Estação de Válvulas de Pressão
  Linha B — Estação de Alavancas de Energia
  Linha C — Estação da Carapaça
  Linha D — Uso reservado do sistema
  Linha E — Indicador de falha crítica ativa

As colunas de 1 a 5 indicam o número do problema —
o número da coluna corresponde ao problema listado
na seção da estação correspondente neste manual.

SISTEMA DE PRIORIDADE
━━━━━━━━━━━━━━━━━━━━━
Quando uma etapa se inicia, três estações recebem sinal
simultaneamente. A estação com indicador piscando rapidamente
deve agir primeiro. As demais aguardam com indicador lento.

Ao concluir sua parte, a estação sinaliza o painel. O indicador
dela apaga e a próxima passa a piscar rapidamente. A ordem
muda a cada tarefa — fique atento ao painel.

MEDIDORES DE CONFIRMAÇÃO
━━━━━━━━━━━━━━━━━━━━━━━━
Abaixo da grade há dois controles de ajuste:

  PRESSÃO — registra o valor indicado pela Estação de Válvulas
  ENERGIA — registra o valor indicado pela Estação de Alavancas

Atenção: quando uma estação realiza mais de uma execução
durante a mesma tarefa, apenas o valor da execução mais
recente deve ser registrado.

Após ajustar ambos os valores corretamente e pressionar
CONFIRMAR, este terminal exibirá as opções de sequência
para a Estação da Carapaça prosseguir.

Valores incorretos resultam em penalidade de tempo.
```

---

### Página 3 — Válvulas

```
VÁLVULAS DE PRESSÃO — ESTAÇÃO DE CONTROLE

A Estação de Válvulas de Pressão é responsável por regular
o fluxo nos dutos de contenção do núcleo Kirlian. Um fluxo
fora dos parâmetros pode comprometer toda a operação.

A estação é composta por quatro dutos verticais principais,
cada um identificado por número da esquerda para a direita.
Cada duto possui uma válvula de roda que pode ser girada
para a esquerda ou para a direita quantas vezes for necessário.
O que importa é a posição final da válvula ao acionar
a liberação — não a ordem dos giros.

Quando o Painel de Controle indicar prioridade para esta
estação, observe o número da coluna acesa. Esse número
corresponde ao Problema abaixo que deve ser executado.
Após ajustar todas as válvulas, acione o duto de liberação.
O medidor indicará o valor gerado, que deve ser informado
ao operador do Painel de Controle.

PROBLEMAS DE PRESSÃO
━━━━━━━━━━━━━━━━━━━━

PROBLEMA 1 — DESESTABILIZAÇÃO DE FLUXO INTERNO

Os sensores detectaram queda de pressão nos dutos internos
de contenção. Para restabelecer o fluxo correto, ajuste
as válvulas da seguinte forma:
Válvula 3 para a esquerda, Válvula 1 para a esquerda,
Válvula 1 para a direita e Válvula 2 para a direita.
Acione o duto de liberação para registrar.

PROBLEMA 2 — VARIAÇÃO DE PRESSÃO DETECTADA

Uma variação fora dos parâmetros foi registrada nos dutos
de saída. Para compensar e estabilizar o fluxo, ajuste
as válvulas da seguinte forma:
Válvula 4 para a direita, Válvula 2 para a direita,
Válvula 3 para a esquerda e Válvula 4 para a direita.
Acione o duto de liberação para registrar.

PROBLEMA 3 — REAJUSTE DE FLUXO DE CONTENÇÃO

O sistema de contenção exige recalibração do fluxo
para manter a estabilidade do campo Kirlian. Ajuste
as válvulas da seguinte forma:
Válvula 2 para a direita, Válvula 4 para a esquerda,
Válvula 1 para a direita, Válvula 3 para a esquerda
e Válvula 2 para a esquerda.
Acione o duto de liberação para registrar.

PROBLEMA 4 — SOBREPRESSÃO ESTRUTURAL

Uma leitura de sobrepressão foi detectada nos dutos
estruturais da carapaça. O reposicionamento das válvulas
é necessário para evitar ruptura. Ajuste da seguinte forma:
Válvula 1 para a direita, Válvula 2 para a esquerda,
Válvula 3 para a direita, Válvula 4 para a direita
e Válvula 1 para a direita.
Acione o duto de liberação para registrar.

PROBLEMA 5 — CALIBRAÇÃO INICIAL DE FLUXO

Os dutos requerem calibração inicial antes que o processo
de extração possa continuar com segurança. Ajuste
as válvulas da seguinte forma:
Válvula 1 para a esquerda, Válvula 3 para a esquerda,
Válvula 1 novamente para a esquerda e Válvula 4 para a direita.
Acione o duto de liberação para registrar.
```

---

### Página 4 — Alavancas

```
ALAVANCAS DE ENERGIA — ESTAÇÃO DE CONTROLE

A Estação de Alavancas de Energia é responsável por regular
a carga energética que alimenta o sistema de contenção do
núcleo Kirlian. Variações fora do tolerado podem causar
instabilidades no campo de contenção.

A estação é composta por cinco alavancas de regulagem,
identificadas por números de 1 a 5. Cada alavanca pode ser
posicionada em três níveis: Superior, Neutro e Inferior.

Quando o Painel de Controle indicar prioridade para esta
estação, observe o número da coluna acesa. Esse número
corresponde ao Problema abaixo que deve ser executado.
Após posicionar todas as alavancas, acione a Alavanca de Carga.
O medidor de energia exibirá o valor gerado, que deve
ser informado ao operador do Painel de Controle.

PROBLEMAS DE ENERGIA
━━━━━━━━━━━━━━━━━━━━

PROBLEMA 1 — INVERSÃO DE CARGA

Uma inversão no campo energético foi detectada e precisa
ser corrigida imediatamente. Posicione as alavancas assim:
Alavanca 1 em Superior, Alavanca 2 em Superior,
Alavanca 3 em Inferior, Alavanca 4 em Inferior
e Alavanca 5 em Neutro.
Acione a Alavanca de Carga para registrar.

PROBLEMA 2 — NIVELAMENTO DE CARGA

A carga energética está desnivelada e precisa de ajuste
para manter a estabilidade do campo de contenção.
Posicione as alavancas assim:
Alavanca 1 em Neutro, Alavanca 2 em Inferior,
Alavanca 3 em Inferior, Alavanca 4 em Superior
e Alavanca 5 em Inferior.
Acione a Alavanca de Carga para registrar.

PROBLEMA 3 — COMPENSAÇÃO ANÔMALA DE CAMPO

Uma leitura anômala exige compensação no campo energético.
Posicione as alavancas da seguinte forma:
Alavanca 2 em Neutro, Alavanca 1 em Superior,
Alavanca 4 em Inferior, Alavanca 3 em Superior
e Alavanca 5 em Inferior.
Acione a Alavanca de Carga para registrar.

PROBLEMA 4 — REGULAGEM DE FASE PRIMÁRIA

A regulagem de fase primária é necessária para estabilizar
o campo energético nesta etapa. Posicione assim:
Alavanca 1 em Inferior, Alavanca 2 em Superior,
Alavanca 3 em Neutro, Alavanca 4 em Neutro
e Alavanca 5 em Superior.
Acione a Alavanca de Carga para registrar.

PROBLEMA 5 — DESCARGA CONTROLADA

Uma descarga de campo energético é necessária para
estabilizar o sistema nesta etapa da operação.
Posicione as alavancas da seguinte forma:
Alavanca 3 em Superior, Alavanca 1 em Neutro,
Alavanca 5 em Superior, Alavanca 2 em Inferior
e Alavanca 4 em Neutro.
Acione a Alavanca de Carga para registrar.
```

---

### Página 5 — Carapaça

```
CARAPAÇA DE CONTENÇÃO — ESTAÇÃO DE CONTROLE

A carapaça é a estrutura física que envolve e mantém o núcleo
Kirlian em estado de contenção segura. Para que o núcleo possa
ser removido e transferido para a maleta de transporte, é
necessário liberar as quatro travas rotativas que prendem
os cabos de contenção à superfície da carapaça.

Cada trava possui uma série de símbolos geométricos em sua
parte giratória. O operador deve girar cada trava até que
o símbolo correto esteja alinhado.

As sequências corretas de símbolos são fornecidas por este
terminal após a validação dos medidores pelo Painel de Controle.
Serão exibidas três opções — apenas uma é a correta para
a etapa em andamento. Comunique-se com sua equipe para
identificar a sequência válida.

Após posicionar as quatro travas corretamente, pressione
o botão de confirmação. Um erro nos símbolos resulta em
penalidade de tempo. Certifique-se antes de confirmar.

A cada tarefa concluída, um cabo de contenção é liberado.
Quando todos os cabos estiverem soltos, o núcleo estará
pronto para ser removido.
```

---

### Página 6 — Falhas Críticas

```
FALHAS CRÍTICAS — PROCEDIMENTOS DE EMERGÊNCIA

Durante a operação, o sistema pode entrar em estado de falha
crítica. Quando isso ocorrer, o Painel de Controle sinalizará
a falha acendendo a linha indicadora de alerta.

Identifique qual estação está apresentando a falha e localize
o procedimento correspondente nesta página. A falha deve ser
resolvida antes que a operação normal possa continuar.

Abaixo estão os procedimentos para cada falha identificada.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FALHA CRÍTICA — ESTAÇÃO DE VÁLVULAS DE PRESSÃO
Tipo: Vazamento de Gás de Contenção

O sistema detectou ruptura em um dos dutos de contenção,
liberando gás de campo Kirlian no ambiente da estação.

ALERTA: caso o operador entre em contato com o gás liberado,
os sentidos de direção ficam temporariamente invertidos.
O operador pode experimentar confusão entre esquerda e
direita durante a exposição. Mantenha a calma e comunique
sua equipe sobre o estado atual.

Para selar o vazamento, execute a seguinte sequência
de ajuste nas válvulas e acione o duto de liberação:
Válvula 4 para a esquerda, Válvula 3 para a direita,
Válvula 1 para a direita, Válvula 4 para a esquerda,
Válvula 2 para a esquerda, Válvula 1 para a esquerda,
Válvula 2 para a direita, Válvula 3 para a direita,
Válvula 4 para a esquerda e Válvula 4 para a esquerda.
Acione o duto de liberação para selar o vazamento.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FALHA CRÍTICA — ESTAÇÃO DE ALAVANCAS DE ENERGIA
Tipo: Sobrecarga de Campo Energético

O sistema detectou sobrecarga no campo energético da estação.
Como consequência, os identificadores das alavancas estão
exibindo leituras incorretas — os números nos visores não
correspondem às posições físicas esperadas.

O operador deve observar atentamente os números exibidos
em cada visor e comunicar sua equipe sobre o que está vendo.
As instruções do manual continuam usando a numeração correta —
o operador é quem precisa localizar cada número na tela
e mover a alavanca correspondente.

Para resolver a sobrecarga, execute três sequências de
estabilização, acionando a Alavanca de Carga ao final de cada uma.

Sequência de Estabilização 1:
Alavanca 4 em Neutro, Alavanca 2 em Inferior,
Alavanca 1 em Superior, Alavanca 5 em Neutro
e Alavanca 3 em Inferior. Acione a Alavanca de Carga.

Sequência de Estabilização 2:
Alavanca 3 em Superior, Alavanca 5 em Inferior,
Alavanca 2 em Neutro, Alavanca 1 em Inferior
e Alavanca 4 em Superior. Acione a Alavanca de Carga.

Sequência de Estabilização 3:
Alavanca 2 em Superior, Alavanca 4 em Neutro,
Alavanca 5 em Superior, Alavanca 3 em Inferior
e Alavanca 1 em Neutro. Acione a Alavanca de Carga.

Após a terceira sequência, os identificadores voltarão
ao normal e a operação pode continuar.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FALHA CRÍTICA — PAINEL DE CONTROLE
Tipo: Interferência no Sistema de Monitoramento

O sistema de monitoramento entrou em colapso parcial.
Os indicadores luminosos estão apresentando leituras
aleatórias e não refletem o estado real das estações.

Para restaurar o painel, o operador deve executar cinco
sequências de calibração nos medidores, confirmando cada uma.
Cada sequência restaura uma linha do painel, da primeira
até a última. Quando a última linha for restaurada, todos
os indicadores piscarão duas vezes em verde e o painel
voltará a operar normalmente.

Sequência 1: PRESSÃO em 0, ENERGIA em 0. Confirmar.
Sequência 2: PRESSÃO em 10, ENERGIA em 10. Confirmar.
Sequência 3: PRESSÃO em 10, ENERGIA em 0. Confirmar.
Sequência 4: PRESSÃO em 0, ENERGIA em 10. Confirmar.
Sequência 5: PRESSÃO em 5, ENERGIA em 5. Confirmar.
```

---

### Página 7 — Eventos

```
EVENTOS INESPERADOS — PROTOCOLOS ESPECIAIS

O sistema Kirlian é instável por natureza.
Anomalias não catalogadas podem ocorrer a qualquer momento.

Em caso de evento não previsto neste manual,
o procedimento recomendado é o seguinte:

  Respire fundo.
  Comunique sua equipe.
  Reze para que funcione.

Boa sorte, operador.
Você vai precisar.
```

---

## Definições Visuais e de Feedback

**Arte:** terminal CMD antigo, monocromático, cor verde. Fonte monoespaçada. Efeito de digitação ou scan nas transições.

**Som:** nenhum.

**Tela principal:** exibe leitura contínua estilo loading — comportamento por tarefa a definir.

**Manual:** interface fixa, não muda durante o jogo. Navegação por setas ou teclado.

**Atalhos de teclado:**
- Abrir manual: **Ctrl**
- Fechar manual: **Esc**
- Navegar páginas: **← →**
- Scroll de conteúdo: **↑ ↓**

---

## O que ainda precisa ser definido

- [ ] Tarefa 5 — comportamento completo desta estação (a definir junto com as demais)

