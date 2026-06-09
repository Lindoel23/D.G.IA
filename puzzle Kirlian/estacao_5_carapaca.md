# Estação 5 — Travas da Carapaça

> Documento específico da Estação 5
> Referência cruzada: Design Base v1.2

---

## Visão Geral

Estação de ação responsável pela conclusão de cada tarefa. O operador gira as 4 travas rotativas até os símbolos corretos e confirma com o botão. É sempre a última estação da cadeia em cada tarefa.

---

## Layout Visual

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  [cabo 1]  [cabo 2]  [cabo 3]  [cabo 4]     ← cabos visuais (acima das travas)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  superfície de metal da carapaça

    [ T1 ]      [ T2 ]      [ T3 ]      [ T4 ]
    (gira)      (gira)      (gira)      (gira)
      •           •           •           •       ← ponto vermelho fixo (alinhamento)


                      [ B ]                       ← botão redondo de confirmação
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**4 travas rotativas (T1 a T4):** posicionadas na superfície metálica da carapaça. A parte que gira exibe os símbolos. Um ponto vermelho fixo indica onde o símbolo correto deve ser alinhado.

**4 cabos visuais:** posicionados acima das travas. Aparecem destravados (iluminados) conforme as tarefas são concluídas. A Tarefa 5 não gera cabo — é a conclusão final.

**Botão de confirmação (B):** botão redondo, sem texto. Aciona a validação das 4 travas simultaneamente.

---

## Símbolos por Trava

Cada trava possui 5 símbolos geométricos. A distribuição foi feita para minimizar repetições entre travas, sem eliminá-las completamente.

| | T1 | T2 | T3 | T4 |
|--|----|----|----|----|
| 1 | ○ | △ | □ | ◇ |
| 2 | △ | ○ | ◇ | ⬡ |
| 3 | ✕ | ⬡ | ○ | □ |
| 4 | ◇ | ✕ | ⊕ | ○ |
| 5 | ⬡ | □ | △ | ✕ |

---

## Lógica de Ativação

A sequência correta das travas **só aparece na Estação 1 após**:
1. Estação 3 e Estação 4 acionarem seus mecanismos de confirmação
2. Estação 2 registrar os dois números nos volumes e apertar o botão de finalização

Ao receber a confirmação da Estação 2, a Estação 1 exibe **3 sequências de símbolos** — apenas uma é a correta. O operador da Estação 5 recebe as opções verbalmente e decide qual bate com a tarefa.

**Confirmação errada → −30 segundos.**

---

## Fluxo de Conclusão de Tarefa

1. Operador posiciona as 4 travas nos símbolos que julga corretos
2. Aperta o botão **B**
3. Se correto:
   - Firebase dispara sinal → todas as estações avançam para a próxima tarefa simultaneamente
   - Cabo correspondente acende na tela da Estação 5
   - Terminal Kirlian exibe briefing da próxima tarefa com [OK] no histórico
4. Se errado: **−30 segundos**, operador corrige e tenta novamente

---

## Sequências por Tarefa

> Notação:
> T1–T4 = trava | símbolo indicado = onde o ponto vermelho deve ficar alinhado
> A Estação 1 exibe 3 opções — apenas uma é verdadeira (indicada abaixo com ✓)

---

### Tarefa 1 — correta na Opção B

```
OPÇÃO A:  T1=⊕  T2=○  T3=⊕  T4=□
OPÇÃO B:  T1=✕  T2=□  T3=△  T4=⬡  ← VERDADEIRA
OPÇÃO C:  T1=⬡  T2=◇  T3=○  T4=✕
```

---

### Tarefa 2 — correta na Opção A

```
OPÇÃO A:  T1=○  T2=⬡  T3=◇  T4=□  ← VERDADEIRA
OPÇÃO B:  T1=△  T2=✕  T3=✕  T4=○
OPÇÃO C:  T1=◇  T2=⊕  T3=△  T4=✕
```

---

### Tarefa 3 — Duas execuções

A Estação 5 age **duas vezes** nesta tarefa. A Estação 1 exibe 3 opções a cada execução.

**Execução 1 — correta na Opção C**
```
OPÇÃO A:  T1=△  T2=◇  T3=○  T4=□
OPÇÃO B:  T1=○  T2=✕  T3=✕  T4=⬡
OPÇÃO C:  T1=⬡  T2=○  T3=⊕  T4=◇  ← VERDADEIRA
```

**Execução 2 — correta na Opção B**
```
OPÇÃO A:  T1=✕  T2=⬡  T3=△  T4=△
OPÇÃO B:  T1=◇  T2=△  T3=⊕  T4=○  ← VERDADEIRA
OPÇÃO C:  T1=□  T2=⊕  T3=○  T4=△
```

---

### Tarefa 4 — correta na Opção A

```
OPÇÃO A:  T1=△  T2=✕  T3=□  T4=⬡  ← VERDADEIRA
OPÇÃO B:  T1=○  T2=⬡  T3=✕  T4=△
OPÇÃO C:  T1=⊕  T2=□  T3=⬡  T4=○
```

---

### Tarefa 5 — Extração Final

Sem execução de travas. Sem botão de confirmação nesta tarefa.

A Estação 5 exibe os 4 cabos visuais destravados e aguarda o sinal do Terminal Kirlian.

Ao pressionar ENTER no Terminal Kirlian:
- Cronômetro para em todas as estações
- Todas as estações exibem brilho roxo por 10 segundos
- Simulação encerrada

---

## Resumo das Sequências Verdadeiras

| Tarefa | T1 | T2 | T3 | T4 |
|--------|----|----|----|----|
| 1 | ✕ | □ | △ | ⬡ |
| 2 | ○ | ⬡ | ◇ | □ |
| 3 exec.1 | ⬡ | ○ | ⊕ | ◇ |
| 3 exec.2 | ◇ | △ | ⊕ | ○ |
| 4 | △ | ✕ | □ | ⬡ |

---

## Comunicação com outras estações

| Evento | Quem é notificado | Como |
|--------|------------------|------|
| Botão B correto | Estação 1 | Exibe "TAREFA CONCLUÍDA" |
| Tarefa concluída | Todas as estações | Firebase dispara após 5 segundos |
| Cabo acende | Apenas Estação 5 | Visual local |
| Botão B errado | Apenas Estação 5 | −30 segundos no cronômetro |

---

## Definições Visuais e de Feedback

**Arte:** superfície de metal da carapaça, estética soviética.

**Som:** nenhum.

**Travas:** giram livremente, símbolos passam pelo ponto vermelho conforme o operador gira.

**Cabos visuais:** aparecem iluminados/destravados ao concluir cada tarefa. Inativos aparecem escuros.

**Botão B:** redondo, sem texto ou label.

**Cronômetro:** caixa flutuante com números vermelhos em contagem regressiva, incluindo milésimos de segundo. Posicionada sem interferir na interface. Se chegar a zero, brilho roxo é acionado em todas as estações e a simulação encerra.

**Encerramento:** brilho roxo em toda a tela por 10 segundos, acionado pelo ENTER do Terminal Kirlian ou por tempo esgotado.

