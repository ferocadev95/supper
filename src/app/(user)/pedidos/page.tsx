import Container from "../../../components/Container";
import Orders from "../../../components/Orders";

const OrdersPage = () => {
    return (
        <Container className="py-10 min-h-[70vh]">
            <h2 className="text-2xl font-semibold accent-bar">Mis Pedidos</h2>
            <Orders />
        </Container>
    );
};

export default OrdersPage;
