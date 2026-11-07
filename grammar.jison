%lex
%%
\s+                   /* skip whitespace */
"int"                 return 'INT';
"if"                  return 'IF';
"else"                return 'ELSE';
"while"               return 'WHILE';
"print"               return 'PRINT';
[0-9]+("."[0-9]+)?\b  return 'NUMBER';
[a-zA-Z_][a-zA-Z0-9_]* return 'ID';
"=="                  return 'EQ';
"="                   return '=';
"+"                   return '+';
"-"                   return '-';
"*"                   return '*';
"/"                   return '/';
"<"                   return '<';
">"                   return '>';
"("                   return '(';
")"                   return ')';
"{"                   return '{';
"}"                   return '}';
";"                   return ';';
<<EOF>>               return 'EOF';
.                     return 'INVALID';
/lex

%left '<' '>' 'EQ'
%left '+' '-'
%left '*' '/'
%nonassoc IF_WITHOUT_ELSE
%nonassoc ELSE

%start program
%%

program
    : stmt_list EOF { return { type: 'Program', body: $1 }; }
    ;

stmt_list
    : stmt stmt_list { $$ = [$1].concat($2); }
    | { $$ = []; }
    ;

stmt
    : INT ID ';' { $$ = { type: 'Declaration', name: $2 }; }
    | ID '=' expr ';' { $$ = { type: 'Assignment', name: $1, value: $3 }; }
    | IF '(' expr ')' block_or_stmt %prec IF_WITHOUT_ELSE { $$ = { type: 'If', cond: $3, pass: $5, fail: null }; }
    | IF '(' expr ')' block_or_stmt ELSE block_or_stmt { $$ = { type: 'If', cond: $3, pass: $5, fail: $7 }; }
    | WHILE '(' expr ')' block_or_stmt { $$ = { type: 'While', cond: $3, body: $5 }; }
    | PRINT '(' expr ')' ';' { $$ = { type: 'Print', expr: $3 }; }
    ;

block_or_stmt
    : '{' stmt_list '}' { $$ = { type: 'Block', body: $2 }; }
    | stmt { $$ = { type: 'Block', body: [$1] }; }
    ;

expr
    : expr '+' expr { $$ = { type: 'Binary', op: '+', left: $1, right: $3 }; }
    | expr '-' expr { $$ = { type: 'Binary', op: '-', left: $1, right: $3 }; }
    | expr '*' expr { $$ = { type: 'Binary', op: '*', left: $1, right: $3 }; }
    | expr '/' expr { $$ = { type: 'Binary', op: '/', left: $1, right: $3 }; }
    | expr '<' expr { $$ = { type: 'Binary', op: '<', left: $1, right: $3 }; }
    | expr '>' expr { $$ = { type: 'Binary', op: '>', left: $1, right: $3 }; }
    | expr 'EQ' expr { $$ = { type: 'Binary', op: '==', left: $1, right: $3 }; }
    | '(' expr ')' { $$ = $2; }
    | NUMBER { $$ = { type: 'Literal', val: Number($1) }; }
    | ID { $$ = { type: 'Identifier', name: $1 }; }
    ;