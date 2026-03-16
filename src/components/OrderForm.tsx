import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogOut, Send, FileText, Calendar, DollarSign, CheckCircle, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OrderFormProps {
  userInfo: { username: string; password: string; userType: string; codigoAcesso: string; municipio: string; name?: string };
  onSubmit: (data: any) => void;
  onLogout: () => void;
  onNavigateToApproved: () => void;
}

const OrderForm = ({ userInfo, onSubmit, onLogout, onNavigateToApproved }: OrderFormProps) => {
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
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.produto || !formData.codigoDoPoste || !formData.solicitante || !formData.cpf || !formData.Rua || !formData.Bairro || !formData.localização || !formData.DatadaSolicitação || !formData.tipoServico || !formData.tipoLampada) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Pedido enviado!",
        description: "Seu pedido foi enviado para aprovação do diretor.",
      });
      onSubmit({
        ...formData,
        solicitante: formData.solicitante,
        enviadoPor: userInfo.username,
        dataEnvio: new Date().toLocaleString('pt-BR'),
        status: 'Aguardando Aprovação'
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Solicitação de Serviços-IPPARK {userInfo.municipio}</h1>
            <p className="text-gray-600">Usuário: {userInfo.name || userInfo.username} (Funcionário) - Município: {userInfo.municipio} - Código: {userInfo.codigoAcesso}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onNavigateToApproved} className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Ver Aprovados
            </Button>
            <Button variant="outline" onClick={onLogout} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>

        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              ORDEM DE SERVIÇOS - IPPARK 
            </CardTitle>
            <CardDescription>
              Preencha os dados do pedido para enviar para aprovação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="produto">Descrição/Solicitação</Label>
                  <Input
                    id="produto"
                    placeholder="Descreva a solicitação ou serviço"
                    value={formData.produto}
                    onChange={(e) => handleInputChange('produto', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="codigodoposte">Código do Poste</Label>
                  <Input
                    id="codigodoposte"
                    type="text"
                    placeholder="Código do poste"
                    value={formData.codigoDoPoste}
                    onChange={(e) => handleInputChange('codigoDoPoste', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="solicitante">Nome</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="solicitante"
                      type="text"
                      placeholder="Nome do solicitante"
                      value={formData.solicitante}
                      onChange={(e) => handleInputChange('solicitante', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    placeholder="CPF do solicitante"
                    value={formData.cpf}
                    onChange={(e) => handleInputChange('cpf', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="Rua">Rua</Label>
                  <Input
                    id="Rua"
                    placeholder="Rua do solicitante"
                    value={formData.Rua}
                    onChange={(e) => handleInputChange('Rua', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="Bairro">Bairro</Label>
                  <Input
                    id="Bairro"
                    placeholder="Bairro do solicitante"
                    value={formData.Bairro}
                    onChange={(e) => handleInputChange('Bairro', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="localizacao">Localização</Label>
                  <Select value={formData.localização} onValueChange={(value) => handleInputChange('localização', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a localização" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Zona Rural">Zona Rural</SelectItem>
                      <SelectItem value="Zona Urbana">Zona Urbana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dataSolicitacao">Data da solicitação</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="dataSolicitacao"
                      type="date"
                      value={formData.DatadaSolicitação}
                      onChange={(e) => handleInputChange('DatadaSolicitação', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                  <Label htmlFor="tipoServico">Tipo de Serviço</Label>
                  <Select value={formData.tipoServico} onValueChange={(value) => handleInputChange('tipoServico', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Instalação de Poste">Instalação de Poste</SelectItem>
                      <SelectItem value="Manutenção de Poste">Manutenção de Poste</SelectItem>
                      <SelectItem value="Remoção de Poste">Remoção de Poste</SelectItem>
                      <SelectItem value="Instalação de Lâmpada">Instalação de Lâmpada</SelectItem>
                      <SelectItem value="Instalação de Lâmpada">Troca de Lâmpada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              <div className="space-y-2">
                  <Label htmlFor="tipoLampada">Tipo de Lâmpada</Label>
                  <Select value={formData.tipoLampada} onValueChange={(value) => handleInputChange('tipoLampada', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de lâmpada" />
                    </SelectTrigger>
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
                <Label htmlFor="justificativa">OBSERVAÇÕES</Label>
                <Textarea
                  id="observações"
                  placeholder="Descreva as observações para este pedido..."
                  value={formData.observações}
                  onChange={(e) => handleInputChange('observações', e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "Enviando..." : "Enviar para Aprovação"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderForm;
