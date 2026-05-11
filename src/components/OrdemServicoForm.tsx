import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Wrench, Calendar, User, Eraser, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import OrdemServicoPrint, { type EmpresaInfo } from './OrdemServicoPrint';

interface OrdemServicoFormProps {
  onSubmit: (data: any) => Promise<any>;
  empresa?: EmpresaInfo;
  responsavel?: string;
}

const EMPTY = {
  produto: '',
  codigoDoPoste: '',
  solicitante: '',
  cpf: '',
  Rua: '',
  Bairro: '',
  localização: '',
  DatadaSolicitação: '',
  tipoServico: '',
  tipoLampada: '',
  observações: '',
};

const OrdemServicoForm = ({ onSubmit, empresa, responsavel }: OrdemServicoFormProps) => {
  const [formData, setFormData] = useState(EMPTY);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const draftOrder = useMemo(
    () => ({
      id: 'preview-os',
      status: 'rascunho',
      created_at: new Date().toISOString(),
      solicitante: formData.solicitante,
      cpf: formData.cpf,
      rua: formData.Rua,
      bairro: formData.Bairro,
      localizacao: formData.localização,
      codigo_poste: formData.codigoDoPoste,
      tipo_servico: formData.tipoServico,
      tipo_lampada: formData.tipoLampada,
      data_solicitacao: formData.DatadaSolicitação,
      observacoes_atendimento: formData.produto || formData.observações,
      observacoes_tecnico: formData.observações,
    }),
    [formData],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tipoServico || !formData.codigoDoPoste) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha pelo menos o tipo de serviço e código do poste.',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      toast({
        title: 'Ordem de Serviço criada!',
        description: 'A O.S. foi enviada com sucesso.',
      });
      setFormData(EMPTY);
    } catch {
      toast({
        title: 'Erro ao criar',
        description: 'Não foi possível criar a ordem de serviço.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => setFormData(EMPTY);
  const empresaInfo = empresa || { nome: '', municipio: '', codigoAcesso: '' };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-6">
      {/* COLUNA ESQUERDA – FORMULÁRIO */}
      <Card className="border-0 shadow-elegant overflow-hidden">
        <CardHeader className="bg-gradient-primary text-primary-foreground p-6">
          <CardTitle className="flex items-center gap-2 text-xl tracking-tight">
            <Wrench className="w-5 h-5" /> Nova Ordem de Serviço
          </CardTitle>
          <CardDescription className="text-primary-foreground/80">
            Preencha os dados do pedido para enviar para aprovação.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Descrição / Solicitação" full>
                <Input
                  placeholder="Descreva o serviço solicitado"
                  value={formData.produto}
                  onChange={(e) => handleInputChange('produto', e.target.value)}
                />
              </Field>

              <Field label="Código do Poste *">
                <Input
                  placeholder="Ex.: PT-1234"
                  value={formData.codigoDoPoste}
                  onChange={(e) => handleInputChange('codigoDoPoste', e.target.value)}
                  required
                />
              </Field>

              <Field label="Nome do Solicitante">
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Nome completo"
                    value={formData.solicitante}
                    onChange={(e) => handleInputChange('solicitante', e.target.value)}
                  />
                </div>
              </Field>

              <Field label="CPF do Solicitante">
                <Input
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange('cpf', e.target.value)}
                />
              </Field>

              <Field label="Rua">
                <Input
                  placeholder="Logradouro"
                  value={formData.Rua}
                  onChange={(e) => handleInputChange('Rua', e.target.value)}
                />
              </Field>

              <Field label="Bairro">
                <Input
                  placeholder="Bairro"
                  value={formData.Bairro}
                  onChange={(e) => handleInputChange('Bairro', e.target.value)}
                />
              </Field>

              <Field label="Localização">
                <Select value={formData.localização} onValueChange={(v) => handleInputChange('localização', v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Zona Rural">Zona Rural</SelectItem>
                    <SelectItem value="Zona Urbana">Zona Urbana</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Data da Solicitação">
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    className="pl-9"
                    value={formData.DatadaSolicitação}
                    onChange={(e) => handleInputChange('DatadaSolicitação', e.target.value)}
                  />
                </div>
              </Field>

              <Field label="Tipo de Serviço *" full>
                <Select value={formData.tipoServico} onValueChange={(v) => handleInputChange('tipoServico', v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione o tipo de serviço" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Instalação de Poste">Instalação de Poste</SelectItem>
                    <SelectItem value="Manutenção de Poste">Manutenção de Poste</SelectItem>
                    <SelectItem value="Remoção de Poste">Remoção de Poste</SelectItem>
                    <SelectItem value="Instalação de Lâmpada">Instalação de Lâmpada</SelectItem>
                    <SelectItem value="Troca de Lâmpada">Troca de Lâmpada</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Tipo de Lâmpada" full>
                <Select value={formData.tipoLampada} onValueChange={(v) => handleInputChange('tipoLampada', v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {['LED 50W','LED 80W','LED 100W','LED 150W','LED 200W','LED 250W','LED 400W','METÁLICA 70W','METÁLICA 100W','METÁLICA 150W','METÁLICA 200W','METÁLICA 250W','METÁLICA 400W','VAPOR DE SÓDIO 100W','VAPOR DE SÓDIO 250W','VAPOR DE SÓDIO 400W'].map(o => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field label="Observações">
              <Textarea
                placeholder="Detalhes adicionais..."
                value={formData.observações}
                onChange={(e) => handleInputChange('observações', e.target.value)}
                rows={3}
              />
            </Field>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" onClick={handleReset} className="gap-2">
                <Eraser className="w-4 h-4" /> Limpar Campos
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-gradient-primary hover:opacity-95 gap-2 shadow-elegant">
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Enviando...' : 'Enviar para Aprovação'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* COLUNA DIREITA – PRÉ-VISUALIZAÇÃO */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Pré-visualização da Ordem de Serviço
            </h2>
          </div>
        </div>
        <div className="rounded-xl bg-gradient-surface border shadow-card p-3 max-h-[calc(100vh-200px)] overflow-y-auto">
          <OrdemServicoPrint
            order={draftOrder}
            empresa={empresaInfo}
            responsavel={responsavel}
            preview
          />
        </div>
      </div>
    </div>
  );
};

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`space-y-1.5 ${full ? 'md:col-span-2' : ''}`}>
      <Label className="text-xs font-medium text-foreground/80">{label}</Label>
      {children}
    </div>
  );
}

export default OrdemServicoForm;
