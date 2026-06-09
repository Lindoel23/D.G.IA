# Estação 3 — Válvulas de Pressão

> Documento específico da Estação 3
> Referência cruzada: Design Base v1.1

---

## Visão Geral

Estação de ação responsável pelo controle de pressão dos canos do sistema de contenção Kirlian. O operador recebe instruções verbais da Estação 1 (Manual) e executa as posições corretas nas válvulas antes de acionar a liberação.

---

## Layout Visual

```
     [v1]        [v2]        [v3]        [v4]
      |            |           |           |
   (roda)       (roda)      (roda)      (roda)
      |            |           |           |
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━ [v5 — deitado] ━━(roda)━━ [LIBERAR →] ░░░medidor░░░
```

**4 canos verticais (v1 a v4):** posicionados em pé, da esquerda para a direita, levemente desgastados visualmente.

**1 cano horizontal (v5 — Cano de Liberação):** posicionado deitado na frente dos quatro, mais abaixo. Contém:
- Válvula de roda no lado esquerdo do cano
- Botão com seta → e texto **LIBERAR** ao lado direito da válvula
- **Medidor semicircular** à direita do botão LIBERAR, com ponteiro iniciando em 0, escala de 0 a 10

---

## Controles

### Válvulas v1 a v4 (canos verticais)
Cada válvula possui dois botões:
- **↑ (topo do cano):** gira para esquerda
- **↓ (base do cano):** gira para direita

### Válvula v5 — Cano de Liberação
- Botão **→ LIBERAR** aciona a confirmação da estação
- Só deve ser acionado quando as 4 válvulas estiverem na posição correta
- Ao ser acionado: medidor exibe o número desta tarefa + sinaliza ao Painel de Luzes

---

## Lógica de Validação (referência para código)

Cada válvula possui um contador interno iniciando em **0**.
- Cada giro para **esquerda:** −1
- Cada giro para **direita:** +1

Ao apertar LIBERAR, o código compara o valor atual de cada válvula com os valores-alvo predefinidos para a tarefa e execução vigente.

**Exemplo:**
```
v1 girada: e, e → valor = −2
v2 não mexida → valor = 0
v3 girada: e → valor = −1
v4 girada: d → valor = +1
Código valida: [v1=−2, v2=0, v3=−1, v4=+1] vs. alvo da tarefa
```

A ordem dos giros não importa — apenas a posição final de cada válvula é validada.

---

## Falha Crítica — Tarefa 2

### O que acontece
Durante a Tarefa 2, ocorre um vazamento de gás que afeta **somente a Estação 3**.

**Efeitos visuais:**
- Tela ganha tonalidade esverdeada
- Indicação de alerta de vazamento

**Efeito de jogabilidade:**
- Os controles ficam **invertidos**: apertar esquerda gira para direita, apertar direita gira para esquerda
- O operador precisa compensar mentalmente ou comunicar à equipe

### Como resolver
Executar a sequência de falha crítica nas válvulas v1–v4 e acionar o botão LIBERAR ao final:

```
Sequência de falha crítica:
v4e, v3d, v1d, v4e, v2e, v1e, v2d, v3d, v4e, v4e
```

Lembrando que com a inversão ativa, os botões funcionam ao contrário — o operador deve girar no sentido oposto ao indicado para obter o movimento desejado.

**Ao apertar LIBERAR com a sequência correta:**
- Tonalidade esverdeada desaparece
- Controles voltam ao normal
- Estação liberada para executar a tarefa normalmente

---

## Execuções por Tarefa

> Notação:
> v1–v4 = qual válvula | e = esquerda | d = direita
> O número após = é o valor que o medidor exibirá ao apertar LIBERAR
> A ordem de girar as válvulas não importa — o que importa é a posição final

---

### Tarefa 1 — Foco nas Válvulas (2 execuções)

A Estação 3 age **duas vezes** nesta tarefa. O Painel de Luzes sinalizará cada vez. Apenas o medidor da **execução mais recente** (Execução 2) é reportado ao Painel.

**Execução 1**
```
Posições finais: v1=−2, v2=0, v3=−1, v4=+1
Giros sugeridos: v1e, v3e, v1e, v4d
Resultado do medidor: 5
```

**Execução 2**
```
Posições finais: v2=+1, v4=−1, v1=+1, v3=−1, v2=−1
Giros sugeridos: v2d, v4e, v1d, v3e, v2e
Resultado do medidor: 7  ← este é o número reportado ao Painel
```

---

### Tarefa 2 — Falha Crítica + Execução Normal

Resolver a Falha Crítica primeiro, depois executar normalmente.

**Sequência de Falha Crítica** (com inversão ativa):
```
v4e, v3d, v1d, v4e, v2e, v1e, v2d, v3d, v4e, v4e → LIBERAR
```

**Execução da Tarefa**
```
Posições finais: v4=+1, v2=+1, v3=−1, v4=+2 (acumulado)
Giros sugeridos: v4d, v2d, v3e, v4d
Resultado do medidor: 3
```

---

### Tarefa 3

**Execução**
```
Posições finais: v3=−1, v1=0, v2=+1
Giros sugeridos: v3e, v1e, v1d, v2d
Resultado do medidor: 9
```

---

### Tarefa 4

**Execução**
```
Posições finais: v1=+2, v2=−1, v3=+1, v4=+1
Giros sugeridos: v1d, v2e, v3d, v4d, v1d
Resultado do medidor: 4
```

---

## Resumo dos Medidores por Tarefa

| Tarefa | Medidor reportado ao Painel |
|--------|-----------------------------|
| 1      | 7 (Execução 2)              |
| 2      | 3                           |
| 3      | 9                           |
| 4      | 4                           |

---

## Comunicação com outras estações

| Evento | Quem é notificado | Como |
|--------|------------------|------|
| LIBERAR acionado corretamente | Estação 2 (Painel) | Linha A apaga, próxima pisca rápido |
| Medidor exibe número | Estação 2 (Painel) | Operador do Painel registra no Volume 1 |
| Falha Crítica ativa | Apenas Estação 3 | Efeito visual local |
| Falha Crítica resolvida | Apenas Estação 3 | Efeito visual local removido |

---

## Definições Visuais e de Feedback

**Arte:** estética soviética desgastada — ferrugem, desgaste nos canos e válvulas.

**Cronômetro:** caixa flutuante com números vermelhos em contagem regressiva, incluindo milésimos de segundo. Posicionada sem interferir na interface. Se chegar a zero, brilho roxo é acionado em todas as estações e a simulação encerra.

**Som:** nenhum.

**Medidor semicircular:**
- Possui seta que se move suavemente até o valor (sem travamento brusco)
- Fica estável ao atingir o valor e **permanece exibindo esse número** até que uma nova execução o substitua
- **Falha Crítica:** o medidor fica oscilando sozinho, subindo e descendo de forma errática enquanto a falha estiver ativa
- Ao resolver a falha: medidor volta a zero
- Ao iniciar cada nova tarefa: medidor zera

**Falha Crítica — animação:**
- Um dos canos libera fumaça verde constante enquanto a falha estiver ativa
- Tonalidade geral da tela fica esverdeada
- Ambos os efeitos somem ao resolver a sequência e apertar LIBERAR

