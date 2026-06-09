# Estação 4 — Alavancas de Energia

> Documento específico da Estação 4
> Referência cruzada: Design Base v1.2

---

## Visão Geral

Estação de ação responsável pelo controle de energia do sistema de contenção Kirlian. O operador recebe instruções verbais da Estação 1 (Manual) e posiciona as alavancas corretamente antes de acionar a Alavanca de Carga.

---

## Layout Visual

```
Parede desgastada com placa de metal

  [A1]      [A2]      [A3]
   ▲          ▲          ▲
  [|||]      [|||]      [|||]      ← alavancas superiores (1, 2, 3)
   ▼          ▼          ▼

  [A4]      [A5]               [A6 — CARGA]
   ▲          ▲                  ▲▲ (dupla)
  [|||]      [|||]              [||||]
   ▼          ▼                  ▼▼

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  [0 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 10]   ← régua medidora
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**5 alavancas de execução (A1 a A5):**
- Dispostas em dois grupos: A1, A2, A3 na fileira superior / A4, A5 na fileira inferior
- Cada alavanca possui painel eletrônico com visor numérico identificando seu número
- Interação: segurar e arrastar para a posição desejada

**Alavanca de Carga (A6):**
- Alavanca dupla, maior, separada do grupo
- Só deve ser acionada após as 5 alavancas estarem na posição correta
- Ao ser acionada: medidor exibe o número da execução + sinaliza ao Painel de Luzes

**Medidor régua:**
- Posicionado abaixo de todas as alavancas
- Escala de 0 a 10
- Zera automaticamente ao iniciar cada nova tarefa

---

## Posições das Alavancas

| Código | Posição |
|--------|---------|
| S | Superior |
| N | Neutro (meio) |
| I | Inferior |

---

## Lógica de Validação (referência para código)

Ao acionar a Alavanca de Carga, o código compara a posição atual de cada alavanca (A1–A5) com os valores-alvo predefinidos para a tarefa e execução vigente.

**Confirmação errada → −30 segundos.** Isso se aplica a qualquer execução em qualquer tarefa.

---

## Falha Crítica — Tarefa 3

### O que acontece
Durante a Tarefa 3 ocorre uma sobrecarga que afeta **somente a Estação 4**.

**Efeito de jogabilidade:**
- Os visores numéricos das alavancas **trocam de posição** — os números aparecem embaralhados nas alavancas erradas
- O Manual estará com a ordem normal (A1, A2, A3, A4, A5), mas os visores na tela estarão em posições diferentes
- O operador precisa comunicar à equipe quais números estão onde para interpretar corretamente as instruções

**Exemplo:** o visor que mostra "1" pode estar fisicamente onde deveria estar o "4" — o operador executa pela posição física do visor, não pela posição esperada.

### Como resolver
Três execuções de falha crítica em sequência, acionando a Alavanca de Carga ao final de cada uma. Com os visores embaralhados, o operador deve seguir os números dos visores como aparecem na tela.

**Sequência de Falha Crítica — Execução FC1**
```
A4n, A2i, A1s, A5n, A3i → Alavanca de Carga
```

**Sequência de Falha Crítica — Execução FC2**
```
A3s, A5i, A2n, A1i, A4s → Alavanca de Carga
```

**Sequência de Falha Crítica — Execução FC3**
```
A2s, A4n, A5s, A3i, A1n → Alavanca de Carga
```

Após a terceira execução, os visores voltam às posições corretas e a estação está liberada para executar a tarefa normalmente.

---

## Execuções por Tarefa

> Notação:
> A1–A5 = qual alavanca | S = Superior | N = Neutro | I = Inferior
> O número após = é o valor que o medidor exibirá ao acionar a Alavanca de Carga
> Confirmação com posição errada → −30 segundos

---

### Tarefa 1

**Execução**
```
A1n, A2i, A3i, A4s, A5i → Alavanca de Carga
Medidor: 9
```

---

### Tarefa 2 — Foco nas Alavancas (2 execuções)

A Estação 4 age **duas vezes** nesta tarefa. Apenas o medidor da **Execução 2** é reportado ao Painel (Volume 2).

**Execução 1**
```
A1i, A2s, A3n, A4n, A5s → Alavanca de Carga
Medidor: 7
```

**Execução 2**
```
A1s, A2s, A3i, A4i, A5n → Alavanca de Carga
Medidor: 1  ← este é o número reportado ao Painel
```

---

### Tarefa 3 — Falha Crítica + Execução Normal

Resolver as 3 execuções de Falha Crítica primeiro, depois executar normalmente.

**Execução da Tarefa**
```
A2n, A1s, A4i, A3s, A5i → Alavanca de Carga
Medidor: 6
```

---

### Tarefa 4

**Execução**
```
A3s, A1n, A5s, A2i, A4n → Alavanca de Carga
Medidor: 2
```

---

### Tarefa 5 — Extração Final

Sem execução nesta estação. Aguarda o sinal de encerramento do Terminal Kirlian.

Ao pressionar ENTER no Terminal Kirlian:
- Cronômetro para
- Brilho roxo por 10 segundos
- Simulação encerrada

---

## Resumo dos Medidores por Tarefa

| Tarefa | Medidor reportado ao Painel (Volume 2) |
|--------|----------------------------------------|
| 1      | 9                                      |
| 2      | 1 (Execução 2)                         |
| 3      | 6                                      |
| 4      | 2                                      |

---

## Comunicação com outras estações

| Evento | Quem é notificado | Como |
|--------|------------------|------|
| Alavanca de Carga acionada corretamente | Estação 2 (Painel) | Linha B apaga, próxima pisca rápido |
| Medidor exibe número | Estação 2 (Painel) | Operador do Painel registra no Volume 2 |
| Falha Crítica ativa | Apenas Estação 4 | Visores embaralhados na tela |
| Falha Crítica resolvida | Apenas Estação 4 | Visores voltam às posições corretas |

---

## Definições Visuais e de Feedback

**Arte:** parede desgastada com placa de metal — estética soviética industrial.

**Som:** nenhum.

**Alavancas:** segurar e arrastar para a posição desejada (Superior / Neutro / Inferior).

**Visor numérico:** painel eletrônico em cada alavanca exibindo seu número identificador.

**Medidor régua:** ponteiro desliza suavemente até o valor ao acionar a Alavanca de Carga. **Permanece exibindo esse número** até que uma nova execução o substitua.
- **Falha Crítica:** o medidor fica oscilando sozinho, subindo e descendo de forma errática enquanto a falha estiver ativa
- Ao resolver a falha: medidor volta a zero
- Ao iniciar cada nova tarefa: medidor zera

**Falha Crítica — visual:** visores numéricos trocam de posição nas alavancas. Sem fumaça ou tonalidade de tela — a confusão é puramente nos números embaralhados.

**Cronômetro:** caixa flutuante com números vermelhos em contagem regressiva, incluindo milésimos de segundo. Posicionada sem interferir na interface. Se chegar a zero, brilho roxo é acionado em todas as estações e a simulação encerra.

---

## Definição da Falha Crítica — Embaralhamento dos Visores

Os visores ficam fisicamente fixos em cima de cada alavanca. O que muda durante a Falha Crítica é o **número exibido** em cada visor.

O embaralhamento é fixo e pré-definido — a ordem dos números nas sequências de Falha Crítica já determina qual visor aparece em qual posição física.

**FC1 — sequência: A4, A2, A1, A5, A3**
```
Posição física:  1    2    3    4    5
Visor exibe:    [4]  [2]  [1]  [5]  [3]
```

**FC2 — sequência: A3, A5, A2, A1, A4**
```
Posição física:  1    2    3    4    5
Visor exibe:    [3]  [5]  [2]  [1]  [4]
```

**FC3 — sequência: A2, A4, A5, A3, A1**
```
Posição física:  1    2    3    4    5
Visor exibe:    [2]  [4]  [5]  [3]  [1]
```

O operador vê os números embaralhados nos visores e precisa localizar onde está o número que o Manual instrui, movendo a alavanca física correspondente.
