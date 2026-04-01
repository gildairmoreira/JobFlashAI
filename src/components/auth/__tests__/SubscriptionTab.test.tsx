import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SubscriptionTab } from "../SubscriptionTab";
import { getUserSubscription } from "@/app/actions/auth-actions";
import usePremiumModal from "@/hooks/usePremiumModal";

// Mocks
jest.mock("@/app/actions/auth-actions", () => ({
  getUserSubscription: jest.fn(),
}));

jest.mock("@/hooks/usePremiumModal", () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe("SubscriptionTab Component", () => {
  const mockSetOpen = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (usePremiumModal as unknown as jest.Mock).mockReturnValue({
      setOpen: mockSetOpen,
    });
  });

  it("deve mostrar estado de carregamento inicial", () => {
    (getUserSubscription as jest.Mock).mockReturnValue(new Promise(() => {})); // Never resolves
    render(<SubscriptionTab />);
    expect(screen.getByText(/Carregando dados da assinatura/i)).toBeInTheDocument();
  });

  it("deve renderizar o Plano FREE corretamente", async () => {
    (getUserSubscription as jest.Mock).mockResolvedValue({
      planType: "FREE",
      currentPeriodEnd: null,
    });

    render(<SubscriptionTab />);

    await waitFor(() => {
      expect(screen.getByText("Plano FREE")).toBeInTheDocument();
    });
    
    expect(screen.getByText("Grátis")).toBeInTheDocument();
    expect(screen.getByText(/Melhore sua conta/i)).toBeInTheDocument();
    expect(screen.getByText("Ver Planos Premium")).toBeInTheDocument();
  });

  it("deve renderizar o Plano PRO corretamente", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    (getUserSubscription as jest.Mock).mockResolvedValue({
      planType: "PRO",
      currentPeriodEnd: futureDate.toISOString(),
    });

    render(<SubscriptionTab />);

    await waitFor(() => {
      expect(screen.getByText("Plano PRO (7 Dias)")).toBeInTheDocument();
    });

    expect(screen.getByText("Ativo")).toBeInTheDocument();
    expect(screen.getByText(/Expira em:/i)).toBeInTheDocument();
    // Verifica se o alerta de upgrade sumiu
    expect(screen.queryByText(/Melhore sua conta/i)).not.toBeInTheDocument();
  });

  it("deve abrir o modal de planos ao clicar no botão de upgrade", async () => {
    (getUserSubscription as jest.Mock).mockResolvedValue({
      planType: "FREE",
      currentPeriodEnd: null,
    });

    render(<SubscriptionTab />);

    const button = await screen.findByText("Ver Planos Premium");
    fireEvent.click(button);

    expect(mockSetOpen).toHaveBeenCalledWith(true);
  });
});
