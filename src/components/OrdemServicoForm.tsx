import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Wrench, Calendar, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import OrdemServicoPrint from './OrdemServicoPrint';

interface OrdemServicoFormProps {
  onSubmit: (data: any) => Promise<any>;
  municipio?: string;
}

const OrdemServicoForm = ({ onSubmit, municipio = '' }: OrdemServicoFormProps) => {
  const [formData, setFormData] = useState({
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
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tipoServico || !formData.codigoDoPoste) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha pelo menos o tipo de serviço e código do poste.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await onSubmit(formData);
      toast({
        title: "Ordem de Serviço criada!",
        description: "A O.S. foi criada com sucesso.",
      });
      if (result?.data) {
        setCreatedOrder(result.data);
      }
      setFormData({
        produto: '', codigoDoPoste: '', solicitante: '', cpf: '',
        Rua: '', Bairro: '', localização: '', DatadaSolicitação: '',
        tipoServico: '', tipoLampada: '', observações: '',
      });
    } catch {
      toast({
        title: "Erro ao criar",
        description: "Não foi possível criar a ordem de serviço.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdOrder) {
    return (
      <div className="space-y-4">
        <OrdemServicoPrint order={createdOrder} municipio={municipio} onClose={() => setCreatedOrder(null)} />
        <div className="text-center">
          <Button variant="outline" onClick={() => setCreatedOrder(null)}>Criar Nova O.S.</Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="w-5 h-5" />
          Nova Ordem de Serviço
        </CardTitle>
        <CardDescription>
          Crie uma ordem de serviço direta (já aprovada)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Descrição/Solicitação</Label>
              <Input placeholder="Descreva o serviço" value={formData.produto} onChange={(e) => handleInputChange('produto', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Código do Poste *</Label>
              <Input placeholder="Código do poste" value={formData.codigoDoPoste} onChange={(e) => handleInputChange('codigoDoPoste', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Solicitante</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input placeholder="Nome do solicitante" value={formData.solicitante} onChange={(e) => handleInputChange('solicitante', e.target.value)} className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>CPF</Label>
              <Input placeholder="CPF" value={formData.cpf} onChange={(e) => handleInputChange('cpf', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Rua</Label>
              <Input placeholder="Rua" value={formData.Rua} onChange={(e) => handleInputChange('Rua', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Bairro</Label>
              <Input placeholder="Bairro" value={formData.Bairro} onChange={(e) => handleInputChange('Bairro', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Localização</Label>
              <Select value={formData.localização} onValueChange={(value) => handleInputChange('localização', value)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Zona Rural">Zona Rural</SelectItem>
                  <SelectItem value="Zona Urbana">Zona Urbana</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input type="date" value={formData.DatadaSolicitação} onChange={(e) => handleInputChange('DatadaSolicitação', e.target.value)} className="pl-10" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Serviço *</Label>
            <Select value={formData.tipoServico} onValueChange={(value) => handleInputChange('tipoServico', value)}>
              <SelectTrigger><SelectValue placeholder="Selecione o tipo de serviço" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Instalação de Poste">Instalação de Poste</SelectItem>
                <SelectItem value="Manutenção de Poste">Manutenção de Poste</SelectItem>
                <SelectItem value="Remoção de Poste">Remoção de Poste</SelectItem>
                <SelectItem value="Instalação de Lâmpada">Instalação de Lâmpada</SelectItem>
                <SelectItem value="Troca de Lâmpada">Troca de Lâmpada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tipo de Lâmpada</Label>
            <Select value={formData.tipoLampada} onValueChange={(value) => handleInputChange('tipoLampada', value)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="LED 50W">LED 50W</SelectItem>
                <SelectItem value="LED 80W">LED 80W</SelectItem>
                <SelectItem value="LED 100W">LED 100W</SelectItem>
                <SelectItem value="LED 150W">LED 150W</SelectItem>
                <SelectItem value="LED 200W">LED 200W</SelectItem>
                <SelectItem value="LED 250W">LED 250W</SelectItem>
                <SelectItem value="LED 400W">LED 400W</SelectItem>
                <SelectItem value="METÁLICA 70W">METÁLICA 70W</SelectItem>
                <SelectItem value="METÁLICA 100W">METÁLICA 100W</SelectItem>
                <SelectItem value="METÁLICA 150W">METÁLICA 150W</SelectItem>
                <SelectItem value="METÁLICA 200W">METÁLICA 200W</SelectItem>
                <SelectItem value="METÁLICA 250W">METÁLICA 250W</SelectItem>
                <SelectItem value="METÁLICA 400W">METÁLICA 400W</SelectItem>
                <SelectItem value="VAPOR DE SÓDIO 100W">VAPOR DE SÓDIO 100W</SelectItem>
                <SelectItem value="VAPOR DE SÓDIO 250W">VAPOR DE SÓDIO 250W</SelectItem>
                <SelectItem value="VAPOR DE SÓDIO 400W">VAPOR DE SÓDIO 400W</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea placeholder="Observações..." value={formData.observações} onChange={(e) => handleInputChange('observações', e.target.value)} rows={3} />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2" disabled={isSubmitting}>
              <Send className="w-4 h-4" />
              {isSubmitting ? "Criando..." : "Criar Ordem de Serviço"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default OrdemServicoForm;
