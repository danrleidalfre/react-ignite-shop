import Link from "next/link";
import {ImageContainer, SuccessContainer} from "@/styles/pages/success";
import {GetServerSideProps} from "next";
import {stripe} from "@/lib/stripe";
import Image from "next/image"
import Stripe from "stripe";

interface SuccessProps {
  costumerName: string;
  product: {
    name: string;
    imageUrl: string;
  }
}

export default function Success({costumerName, product}: SuccessProps) {
  return (
    <SuccessContainer>
      <h1>Compra efetuada</h1>

      <ImageContainer>
        <Image src={product.imageUrl} width={120} height={110} alt=""/>
      </ImageContainer>

      <p>
        Uhuul <strong>{costumerName}</strong>, sua <strong>{product.name}</strong> já está a caminho da sua casa.
      </p>

      <Link href="/">
        Voltar ao catálogo
      </Link>
    </SuccessContainer>
  )
}

export const getServerSideProps: GetServerSideProps = async ({query}) => {
  const sessionId = String(query.session_id);

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'line_items.data.price.product']
  });

  let costumerName: string = "";
  let product: { name: string; imageUrl: string } = {name: "", imageUrl: ""};

  if (session.customer_details && session.customer_details.name) {
    costumerName = session.customer_details.name;
  }

  if (
    session.line_items &&
    session.line_items.data &&
    session.line_items.data.length > 0 &&
    session.line_items.data[0].price &&
    session.line_items.data[0].price.product
  ) {
    const productData = session.line_items.data[0].price.product as Stripe.Product;
    product = {
      name: productData.name || "", // Ensure name is not null
      imageUrl: productData.images && productData.images.length > 0 ? productData.images[0] : "" // Ensure imageUrl is not null
    };
  }

  return {
    props: {
      costumerName,
      product
    }
  };
};
