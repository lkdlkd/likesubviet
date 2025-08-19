import React from "react";
import Table from "react-bootstrap/Table";

export default function Tailieuapi() {
    const API_DOMAIN = `${process.env.REACT_APP_API_BASE}/v2`; // Lấy tên miền hiện tại và thêm đường dẫn API

    return (
        <div className="page-content">
            <div className="container-fluid">
                <div className="card-body">
                    <div className="table-responsive mb-5">
                        <Table striped bordered hover>
                            <tbody>
                                <tr>
                                    <td className="text-gray-700">API URL</td>
                                    <td className="fw-bolder">{API_DOMAIN}</td>
                                </tr>
                                <tr>
                                    <td className="text-gray-700">API Key</td>
                                    <td className="fw-bolder">
                                        <a href="/profile">Lấy tại đây</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-gray-700">HTTP Method</td>
                                    <td className="fw-bolder">POST</td>
                                </tr>
                                <tr>
                                    <td className="text-gray-700">Content-Type</td>
                                    <td className="fw-bolder">application/json</td>
                                </tr>
                                <tr>
                                    <td className="text-gray-700">Response</td>
                                    <td className="fw-bolder">JSON</td>
                                </tr>
                            </tbody>
                        </Table>
                    </div>

                    <div className="d-flex flex-column flex-md-row">
                        <ul
                            className="nav nav-tabs nav-pills border-0 flex-row flex-md-column me-5 mb-3 mb-md-0 fs-6"
                            role="tablist"
                        >
                            {[
                                { id: "services", label: "Services" },
                                { id: "add", label: "Add order" },
                                { id: "status", label: "Order status" },
                                { id: "multistatus", label: "Multiple orders status" },
                                { id: "cancel", label: "Cancel order" },
                                { id: "refill", label: "Refill order" },
                                { id: "balance", label: "Balance" },
                            ].map((tab, index) => (
                                <li className="nav-item w-md-200px me-0" role="presentation" key={index}>
                                    <a
                                        className={`nav-link ${index === 0 ? "active" : ""}`}
                                        data-bs-toggle="tab"
                                        href={`#${tab.id}`}
                                        aria-selected={index === 0}
                                        role="tab"
                                    >
                                        {tab.label}
                                    </a>
                                </li>
                            ))}
                        </ul>

                        <div className="tab-content w-100">
                            {[
                                {
                                    id: "services",
                                    content: (
                                        <>
                                            <Table striped bordered hover>
                                                <tbody>
                                                    <tr className="bg-light">
                                                        <td className="fw-bolder" data-lang="Parameters">
                                                            Parameters
                                                        </td>
                                                        <td className="fw-bolder" data-lang="Description">
                                                            Description
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>key</td>
                                                        <td>API Key</td>
                                                    </tr>
                                                    <tr>
                                                        <td>action</td>
                                                        <td>"services"</td>
                                                    </tr>
                                                </tbody>
                                            </Table>
                                            <h6 data-lang="Example response">Example response</h6>
                                            <div className="bg-light p-3">
                                                <pre className="language-html mb-0">
                                                    {`[
  {
    "service": 1,
    "name": "Facebook views",
    "type": "Default",
    "category": "Facebook",
    "rate": "2.5",
    "min": "200",
    "max": "10000",
    "refill": true
  },
  {
    "service": 2,
    "name": "Tiktok views",
    "type": "Default",
    "category": "Tiktok",
    "rate": "4",
    "min": "10",
    "max": "1500",
    "refill": false
  }
]`}
                                                </pre>
                                            </div>
                                        </>
                                    ),
                                },
                                {
                                    id: "add",
                                    content: (
                                        <>
                                            <Table striped bordered hover>
                                                <tbody>
                                                    <tr className="bg-light">
                                                        <td className="fw-bolder" data-lang="Parameters">
                                                            Parameters
                                                        </td>
                                                        <td className="fw-bolder" data-lang="Description">
                                                            Description
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>key</td>
                                                        <td>API Key</td>
                                                    </tr>
                                                    <tr>
                                                        <td>action</td>
                                                        <td>"add"</td>
                                                    </tr>
                                                    <tr>
                                                        <td>service</td>
                                                        <td>Service ID</td>
                                                    </tr>
                                                    <tr>
                                                        <td>link</td>
                                                        <td>Link</td>
                                                    </tr>
                                                    <tr>
                                                        <td>quantity</td>
                                                        <td>Needed quantity</td>
                                                    </tr>
                                                </tbody>
                                            </Table>
                                            <h6 data-lang="Example response">Example response</h6>
                                            <div className="bg-light p-3">
                                                <pre className="language-html mb-0">{`{
  "order": 99999
}`}</pre>
                                            </div>
                                        </>
                                    ),
                                },
                                {
                                    id: "status",
                                    content: (
                                        <>
                                            <Table striped bordered hover>
                                                <tbody>
                                                    <tr className="bg-light">
                                                        <td className="fw-bolder" data-lang="Parameters">
                                                            Parameters
                                                        </td>
                                                        <td className="fw-bolder" data-lang="Description">
                                                            Description
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>key</td>
                                                        <td>API Key</td>
                                                    </tr>
                                                    <tr>
                                                        <td>action</td>
                                                        <td>"status"</td>
                                                    </tr>
                                                    <tr>
                                                        <td>order</td>
                                                        <td>Order ID</td>
                                                    </tr>
                                                    {/* <tr>
                                                        <td>Status : Pending, Processing, In progress, Completed, Partial, Canceled</td>
                                                    </tr> */}
                                                </tbody>
                                            </Table>
                                            <h6 data-lang="Example response">Example response</h6>
                                            <div className="bg-light p-3">
                                                <pre className="language-html mb-0">
                                                    {`
{
    "charge": "2.5",
    "start_count": "168",
    "status": "Completed",
    "remains": "-2"
}`}
                                                </pre>

                                            </div>
                                            <span>Status : Pending, Processing, In progress, Completed, Partial, Canceled</span>

                                        </>
                                    ),
                                },
                                {
                                    id: "multistatus",
                                    content: (
                                        <>
                                            <Table striped bordered hover>
                                                <tbody>
                                                    <tr className="bg-light">
                                                        <td className="fw-bolder" data-lang="Parameters">
                                                            Parameters
                                                        </td>
                                                        <td className="fw-bolder" data-lang="Description">
                                                            Description
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>key</td>
                                                        <td>API Key</td>
                                                    </tr>
                                                    <tr>
                                                        <td>action</td>
                                                        <td>"status"</td>
                                                    </tr>
                                                    <tr>
                                                        <td>orders</td>
                                                        <td style={{
                                                            maxWidth: "570px",
                                                            whiteSpace: "normal",
                                                            wordWrap: "break-word",
                                                            overflowWrap: "break-word",
                                                        }}>Order IDs separated by comma (E.g: 123,456,789) (Limit 100)</td>
                                                    </tr>
                                                </tbody>
                                            </Table>
                                            <h6 data-lang="Example response">Example response</h6>
                                            <div className="bg-light p-3">
                                                <pre className="language-html mb-0">
                                                    {`
{
    "123": {
        "charge": "0.27819",
        "start_count": "3572",
        "status": "Partial",
        "remains": "157"
    },
    "456": {
        "error": "Incorrect order ID"
    },
    "789": {
        "charge": "1.44219",
        "start_count": "234",
        "status": "In progress",
        "remains": "10"
    }
}`}
                                                </pre>
                                            </div>
                                        </>
                                    ),
                                },
                                {
                                    id: "balance",
                                    content: (
                                        <>
                                            <Table striped bordered hover>
                                                <tbody>
                                                    <tr className="bg-light">
                                                        <td className="fw-bolder" data-lang="Parameters">
                                                            Parameters
                                                        </td>
                                                        <td className="fw-bolder" data-lang="Description">
                                                            Description
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>key</td>
                                                        <td>API Key</td>
                                                    </tr>
                                                    <tr>
                                                        <td>action</td>
                                                        <td>"balance"</td>
                                                    </tr>
                                                </tbody>
                                            </Table>
                                            <h6 data-lang="Example response">Example response</h6>
                                            <div className="bg-light p-3">
                                                <pre className="language-html mb-0">
                                                    {`  
{
    "balance": "343423",
    "currency": "USD"
}`}
                                                </pre>
                                            </div>
                                        </>
                                    ),
                                },
                                {
                                    id: "cancel",
                                    content: (
                                        <>
                                            <Table striped bordered hover>
                                                <tbody>
                                                    <tr className="bg-light">
                                                        <td className="fw-bolder" data-lang="Parameters">
                                                            Parameters
                                                        </td>
                                                        <td className="fw-bolder" data-lang="Description">
                                                            Description
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>key</td>
                                                        <td>API Key</td>
                                                    </tr>
                                                    <tr>
                                                        <td>action</td>
                                                        <td>"cancel"</td>
                                                    </tr>
                                                    <tr>
                                                        <td>order</td>
                                                        <td>Order ID</td>
                                                    </tr>
                                                </tbody>
                                            </Table>
                                            <h6 data-lang="Example response">Example response</h6>
                                            <div className="bg-light p-3">
                                                <pre className="language-html mb-0">
                                                    {`
{
    "order": 2,
    "cancel": 1
}
`}
                                                </pre>
                                            </div>
                                        </>
                                    ),
                                },
                                {
                                    id: "refill",
                                    content: (
                                        <>
                                            <Table striped bordered hover>
                                                <tbody>
                                                    <tr className="bg-light">
                                                        <td className="fw-bolder" data-lang="Parameters">
                                                            Parameters
                                                        </td>
                                                        <td className="fw-bolder" data-lang="Description">
                                                            Description
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>key</td>
                                                        <td>API Key</td>
                                                    </tr>
                                                    <tr>
                                                        <td>action</td>
                                                        <td>"refill"</td>
                                                    </tr>
                                                    <tr>
                                                        <td>order</td>
                                                        <td>Order ID</td>
                                                    </tr>
                                                </tbody>
                                            </Table>
                                            <h6 data-lang="Example response">Example response</h6>
                                            <div className="bg-light p-3">
                                                <pre className="language-html mb-0">
                                                    {`
{
    "refill": "1"
}`}
                                                </pre>
                                            </div>
                                        </>
                                    ),
                                },
                                // Add other tabs similarly...
                            ].map((tab, index) => (
                                <div
                                    className={`tab-pane fade ${index === 0 ? "show active" : ""}`}
                                    id={tab.id}
                                    role="tabpanel"
                                    key={index}
                                >
                                    {tab.content}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}