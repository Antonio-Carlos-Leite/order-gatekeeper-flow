import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogOut, Send, FileText, Calendar, DollarSign, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OrderFormProps {
  userInfo: { username: string; password: string; userType: string; codigoAcesso: string; municipio: string };
  onSubmit: (data: any) => void;
  onLogout: () => void;
  onNavigateToApproved: () => void;
}

const OrderForm = ({ userInfo, onSubmit, onLogout, onNavigateToApproved }: OrderFormProps) => {
  const [formData, setFormData] = useState({
    produto: '',
    quantidade: '',
    valor: '',
    fornecedor: '',
    categoria: '',
    prazoEntrega: '',
    justificativa: '',
    urgencia: 'normal'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.produto || !formData.quantidade || !formData.valor || !formData.fornecedor) {
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
        solicitante: userInfo.username,
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
            <h1 className="text-3xl font-bold text-gray-900">Cadastro de Pedido</h1>
            <p className="text-gray-600">Usuário: {userInfo.username} (Funcionário) - Município: {userInfo.municipio} - Código: {userInfo.codigoAcesso}</p>
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
              Novo Pedido de Compra
            </CardTitle>
            <CardDescription>
              Preencha os dados do pedido para enviar para aprovação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="produto">Produto/Serviço *</Label>
                  <Input
                    id="produto"
                    placeholder="Nome do produto ou serviço"
                    value={formData.produto}
                    onChange={(e) => handleInputChange('produto', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quantidade">Quantidade *</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    placeholder="Quantidade"
                    value={formData.quantidade}
                    onChange={(e) => handleInputChange('quantidade', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor Total (R$) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={formData.valor}
                      onChange={(e) => handleInputChange('valor', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fornecedor">Fornecedor *</Label>
                  <Input
                    id="fornecedor"
                    placeholder="Nome do fornecedor"
                    value={formData.fornecedor}
                    onChange={(e) => handleInputChange('fornecedor', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select onValueChange={(value) => handleInputChange('categoria', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="material-escritorio">Material de Escritório</SelectItem>
                      <SelectItem value="equipamentos">Equipamentos</SelectItem>
                      <SelectItem value="servicos">Serviços</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="prazoEntrega">Prazo de Entrega</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="prazoEntrega"
                      type="date"
                      value={formData.prazoEntrega}
                      onChange={(e) => handleInputChange('prazoEntrega', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="urgencia">Nível de Urgência</Label>
                <Select onValueChange={(value) => handleInputChange('urgencia', value)} defaultValue="normal">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="justificativa">Justificativa</Label>
                <Textarea
                  id="justificativa"
                  placeholder="Descreva a justificativa para este pedido..."
                  value={formData.justificativa}
                  onChange={(e) => handleInputChange('justificativa', e.target.value)}
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
