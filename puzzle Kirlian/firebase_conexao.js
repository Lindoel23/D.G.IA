/**
 * =========================================================================
 * GERENCIADOR DE CONEXÃO FIREBASE — PUZZLE KIRLIAN (ARQUITETURA V2)
 * =========================================================================
 * 
 * Este arquivo serve como a DOCUMENTAÇÃO DE REFERÊNCIA DEFINITIVA para a 
 * arquitetura de conexão entre as 5 estações e o Firebase Realtime Database.
 * NENHUM CÓDIGO DESTE ARQUIVO É EXECUTADO DIRETAMENTE. As implementações 
 * reais estão nos arquivos `js.js` de cada respectiva estação.
 * 
 * -------------------------------------------------------------------------
 * 1. ESTRUTURA DO ESTADO NO BANCO DE DADOS (SINGLE SOURCE OF TRUTH)
 * -------------------------------------------------------------------------
 * 
 * ordem/puzzles/kirlian/state: {
 *   // CONTROLE DE FLUXO
 *   inicio: false,             // Trigger inicial (setado pela Carapaça)
 *   sinalInicio: false,        // Sinal transitório de inicialização
 *   sinal: "",                 // Ex: 'INICIO', 'AVANCAR'
 *   fase: 0,                   // 0 (Intro) a 5 (Extração Final)
 *   tarefaIniciada: false,     // true quando Est.1 aperta ENTER no briefing
 *   jogoEncerrado: false,      // true em caso de vitória ou derrota
 *   tipoFim: "",               // "vitoria" ou "derrota"
 * 
 *   // CONTROLE DE EXECUÇÃO (TAREFAS)
 *   medidoresOk: false,        // true quando Est.2 (Painel) valida Medidores
 *   travasOk: false,           // true quando Est.5 (Carapaça) valida as Travas (após a ÚLTIMA execução da fase)
 *   travasExecucao: 1,         // Qual execução das travas (Usado na Tarefa 3, que tem 2 execuções)
 *   falhaCriticaResolvida: true, // true quando Est.3 ou Est.4 resolvem Falha Crítica
 *   cadeiaPasso: 0,            // Contador (atualizado via transaction) que define qual luz pisca no Painel (Est.2)
 * 
 *   // CRONÔMETRO (NOVO SISTEMA TRANSACTION-BASED)
 *   cronometroMs: 900000,      // Tempo real em ms (inicia em 15min = 900000ms)
 *   cronometroPausado: true    // Controlado pelo Modal Admin do Manual
 * }
 * 
 * -------------------------------------------------------------------------
 * 2. MASTER TIMER LOOP (ESTAÇÃO 1 - MANUAL)
 * -------------------------------------------------------------------------
 * 
 * A Estação 1 (Manual) atua como MASTER do tempo. A cada 1 segundo (1000ms), 
 * o Manual executa uma transação no Firebase que subtrai 1000ms de `cronometroMs`:
 * 
 * gameRef.child('cronometroMs').transaction(current => {
 *     if (current === null) return 900000;
 *     let next = current - 1000;
 *     return next < 0 ? 0 : next;
 * });
 * 
 * -------------------------------------------------------------------------
 * 3. PENALIDADES E BÔNUS (ESTAÇÕES INDIVIDUAIS)
 * -------------------------------------------------------------------------
 * 
 * As estações NÃO USAM mais os campos `penalidadesMs` ou `tempoExtraMs`.
 * Em vez disso, aplicam Bônus e Penalidades DIRETAMENTE no `cronometroMs`
 * através de transações do Firebase, prevenindo race conditions e sobrescritas
 * pelo Master Timer.
 * 
 * Exemplo de Penalidade (-30s) na Estação de Válvulas ou Alavancas:
 * gameRef.child('cronometroMs').transaction(t => t === null ? 900000 : (t - 30000 < 0 ? 0 : t - 30000));
 * 
 * Exemplo de Bônus (+60s) na Estação da Carapaça (ao concluir uma Tarefa):
 * gameRef.child('cronometroMs').transaction(t => t === null ? 900000 : t + 60000);
 * 
 * -------------------------------------------------------------------------
 * 4. CADEIA DE PROGRESSÃO DO PAINEL (CADEIAPASSO)
 * -------------------------------------------------------------------------
 * 
 * Quando as estações 3 (Válvulas) ou 4 (Alavancas) concluem suas etapas nas
 * Tarefas 1, 2, 3 ou 4, elas não enviam mais triggers individuais soltos.
 * Elas incrementam de forma transacional o contador `cadeiaPasso`:
 * 
 * gameRef.child('cadeiaPasso').transaction(val => (val || 0) + 1);
 * 
 * O Painel escuta `cadeiaPasso` para saber exatamente qual LED na matriz
 * deve piscar (Fast Blink) indicando de quem é o turno atual.
 * 
 * -------------------------------------------------------------------------
 * 5. AUTO-AVANÇO DE FASES (TRAVAS_OK)
 * -------------------------------------------------------------------------
 * 
 * Quando a Carapaça valida os símbolos corretamente:
 * 1. Se for a Fase 3 (Execução 1): Atualiza APENAS `travasExecucao = 2`.
 * 2. Se for qualquer outra Fase (ou Fase 3 Exec 2): Atualiza `travasOk = true`.
 * 
 * A Estação 1 (Manual), ao detectar `travasOk == true`, automaticamente:
 * - Avança `fase = fase + 1`
 * - Reseta `tarefaIniciada = false`, `medidoresOk = false`, `travasOk = false`, `travasExecucao = 1`
 * - Reseta o Painel com `cadeiaPasso = 0` (indiretamente pelas outras estações)
 * 
 * -------------------------------------------------------------------------
 * 6. MODAL ADMIN (RESET & PAUSE)
 * -------------------------------------------------------------------------
 * 
 * O botão [RESET] na Estação 1 permite, via senha "theorder", acessar o 
 * Controle do Sistema, de onde o operador pode:
 * - Pausar/Retomar: Atualiza `cronometroPausado: true|false`. Todas as 
 *   animações de UI param e o Master Timer interrompe o loop.
 * - Resetar Tudo: Subscreve todo o path `state` do Firebase com a árvore
 *   inicial listada na Seção 1.
 */
