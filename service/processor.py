import json
import os
import time

from kafka import KafkaConsumer, KafkaProducer

BOOTSTRAP_SERVER = os.getenv("KAFKA_BOOTSTRAP_SERVER", "kafka:9092")
INPUT_TOPIC = "stock-orders"
OUTPUT_TOPIC = "order-confirmed"
GROUP_ID = "zerodha-order-processor"


def create_consumer():
    return KafkaConsumer(
        INPUT_TOPIC,
        bootstrap_servers=[BOOTSTRAP_SERVER],
        auto_offset_reset="earliest",
        enable_auto_commit=True,
        group_id=GROUP_ID,
        value_deserializer=lambda v: json.loads(v.decode("utf-8")),
    )


def create_producer():
    return KafkaProducer(
        bootstrap_servers=[BOOTSTRAP_SERVER],
        key_serializer=lambda k: str(k).encode("utf-8") if k is not None else None,
        value_serializer=lambda v: json.dumps(v).encode("utf-8"),
    )


def extract_header(headers, key):
    for header_key, header_value in headers:
        if header_key == key:
            return header_value.decode("utf-8") if header_value else ""
    return ""


def process_order(payload):
    qty = payload.get("qty", 0)
    price = payload.get("price", 0.0)
    total = round(qty * price, 2)

    return {
        "orderId": payload.get("orderId"),
        "totalAmount": total,
        "status": "CONFIRMED",
    }


def main():
    while True:
        try:
            consumer = create_consumer()
            producer = create_producer()
            print(f"Order processor connected to Kafka at {BOOTSTRAP_SERVER}")

            for message in consumer:
                trace_id = extract_header(message.headers, "traceId")
                response = process_order(message.value)
                msg_key = message.key.decode("utf-8") if message.key else None

                headers = [("traceId", trace_id.encode("utf-8"))] if trace_id else []
                producer.send(OUTPUT_TOPIC, key=msg_key, value=response, headers=headers)
                producer.flush()
                print(f"Processed order {message.value.get('orderId')} → {response}")

        except Exception as e:
            print(f"Processor error: {e}. Retrying in 2 seconds...")
            time.sleep(2)


if __name__ == "__main__":
    main()
