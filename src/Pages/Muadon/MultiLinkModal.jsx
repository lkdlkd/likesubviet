import React, { useEffect, useState } from "react";
import { Button, Modal, Table, Form } from "react-bootstrap";
import Select from "react-select";

export default function MultiLinkModal({
    show,
    onHide,
    filteredServers,
    selectedMagoi,
    setSelectedMagoi,
    isSubmitting,
    quantity,
    setQuantity,
    setIsStopped,
    isStopped,
    comments,
    setComments,
    setcomputedQty,
    min,
    setMin,
    max,
    setMax,
    multiLinkInput,
    setMultiLinkInput,
    multiLinkList,
    setMultiLinkList,
    selectedMultiLinks,
    setSelectedMultiLinks,
    rate,
    setRate,
    handleMultiLinkSubmit
}) {
    // Khi chọn server mới, cập nhật cả rate
    const handleServerChange = (opt) => {
        setSelectedMagoi(opt ? opt.value : "");
        if (opt && opt.serverObj) {
            setMin(opt.serverObj.min);
            setRate(opt.serverObj.rate);
            setMax(opt.serverObj.max);
            setQuantity(opt.serverObj.min); // Đặt số lượng mặc định là min

        }
    };
    // Chọn tất cả
    const handleCheckAll = (e) => {
        if (e.target.checked) {
            setSelectedMultiLinks(multiLinkList.map((_, i) => i));
        } else {
            setSelectedMultiLinks([]);
        }
    };
    const selectedService = filteredServers.find(service => service.Magoi === selectedMagoi);
    // Tính tổng tiền các link đã chọn
    const totalSelected = selectedMultiLinks.length;
    const totalAmount = quantity * rate * totalSelected;
    useEffect(() => {
        const computedQty = comments
            .split(/\r?\n/)
            .filter((line) => line.trim() !== "").length;
        setcomputedQty(computedQty);
    }, [comments]);
    // Hàm rút gọn link TikTok

    const shortenSocialLink = (url) => {
        if (typeof url !== 'string') return url;
        // Nếu là Facebook hoặc fb thì trả về nguyên bản
        if (/facebook\.com|fb\.com/i.test(url)) {
            return url;
        }
        // Loại bỏ query và fragment
        let cleanUrl = url.split('?')[0].split('#')[0];

        // Xử lý TikTok
        if (cleanUrl.includes('tiktok.com') || cleanUrl.includes('vt.tiktok.com')) {
            if (/vt\.tiktok\.com|tiktok\.com\/t\//.test(cleanUrl)) {
                return url; // giữ nguyên link redirect TikTok
            }
            const mMatch = cleanUrl.match(/m\.tiktok\.com\/v\/(\d+)\.html/);
            if (mMatch) {
                return `https://www.tiktok.com/video/${mMatch[1]}`;
            }
            const userVideoMatch = cleanUrl.match(/tiktok\.com\/@([\w.-]+)\/video\/(\d+)/);
            if (userVideoMatch) {
                return `https://www.tiktok.com/@${userVideoMatch[1]}/video/${userVideoMatch[2]}`;
            }
            const userPhotoMatch = cleanUrl.match(/tiktok\.com\/@([\w.-]+)\/photo\/(\d+)/);
            if (userPhotoMatch) {
                return `https://www.tiktok.com/@${userPhotoMatch[1]}/photo/${userPhotoMatch[2]}`;
            }
            const videoMatch = cleanUrl.match(/tiktok\.com\/video\/(\d+)/);
            if (videoMatch) {
                return `https://www.tiktok.com/video/${videoMatch[1]}`;
            }
            return cleanUrl;
        }

        // Xử lý Instagram: chỉ giữ lại đường dẫn gốc
        if (cleanUrl.includes('instagram.com')) {
            return cleanUrl;
        }

        // Xử lý YouTube
        if (url.includes('youtube.com/watch') || url.includes('youtu.be')) {
            const ytMatch = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:[&#?]|$)/);
            if (ytMatch) {
                return `https://www.youtube.com/watch?v=${ytMatch[1]}`;
            }
        }

        // Mặc định: trả về URL không có query và fragment
        return cleanUrl;
    };
    const [showServerWarning, setShowServerWarning] = useState(false);
    const handleAddLinks = () => {
        if (!selectedMagoi) {
            setShowServerWarning(true);
            return;
        }
        setShowServerWarning(false);
        const rawLinks = multiLinkInput
            .split("\n")
            .map(l => l.trim())
            .filter(l => l !== "" && !multiLinkList.some(item => item.link === shortenSocialLink(l)));
        const newLinks = rawLinks.map(l => ({ link: shortenSocialLink(l), ObjectLink: l }));
        if (newLinks.length > 0) {
            const commentArr = comments
                .split("\n")
                .map(c => c.trim())
                .filter(c => c !== "");
            const qty = commentArr.length || quantity;
            setMultiLinkList(list => [
                ...list,
                ...newLinks.map(item => ({ ...item, comment: commentArr.join("\n"), quantity: qty }))
            ]);
            setMultiLinkInput("");
        }
    };
    return (
        <Modal show={show} onHide={onHide} size="xl" backdrop="static">
            <div className="modal-content">
                <div className="modal-header bg-info">
                    <h6 className="modal-title m-0 text-white">Mua nhiều đơn cùng lúc</h6>
                    <button type="button" className="btn-close" onClick={onHide} aria-label="Close"></button>
                </div>
                <div className="modal-body">
                    <div className="row">
                        <div className="col-md-4 card card-body">
                            <div className="form-group mb-3">
                                <label className="form-label text-dark">Chọn máy chủ</label>
                                <Select
                                    options={filteredServers.map(server => ({
                                        value: server.Magoi,
                                        label: `[${server.Magoi}] ${server.maychu} ${server.name} - ${Number(server.rate).toLocaleString("en-US")}đ`,
                                        serverObj: server
                                    }))}
                                    value={filteredServers
                                        .filter(server => server.Magoi === selectedMagoi)
                                        .map(server => ({
                                            value: server.Magoi,
                                            label: `[${server.Magoi}] ${server.maychu} ${server.name} - ${Number(server.rate).toLocaleString("en-US")}đ`,
                                            serverObj: server
                                        }))}
                                    onChange={handleServerChange}
                                    isDisabled={isSubmitting || multiLinkList.length > 0}
                                    placeholder="Chọn máy chủ"
                                />
                            </div>
                            {filteredServers.map((server, index) => (
                                selectedMagoi === server.Magoi && (
                                    <div key={index} className="alert alert-warning">
                                        <h5 style={{ textAlign: "center" }}>Lưu ý gói</h5>
                                        <div dangerouslySetInnerHTML={{ __html: server.description }} />
                                    </div>
                                )
                            ))} {(() => {
                                const selectedService = filteredServers.find(
                                    (service) => service.Magoi === selectedMagoi
                                );
                                if (selectedService && selectedService.comment === "on") {
                                    return (
                                        <div className="form-group mb-3">
                                            <label className="form-label text-dark">
                                                Nhập Comment (áp dụng cho tất cả link, mỗi dòng 1 comment)
                                                <b> Số lượng cmt: <span style={{ color: "red" }}>{comments.split("\n").filter(c => c.trim() !== "").length}</span></b>
                                            </label>
                                            <textarea
                                                className="form-control"
                                                placeholder="Mỗi dòng 1 comment, sẽ áp dụng cho tất cả link khi thêm vào danh sách"
                                                value={comments}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setComments(val);
                                                    if (selectedService && selectedService.comment === "on" && multiLinkList.length > 0) {
                                                        const qty = val.split("\n").filter(c => c.trim() !== "").length;
                                                        setMultiLinkList(list => list.map(it => ({ ...it, comment: val, quantity: qty })));
                                                    }
                                                }}
                                                disabled={isSubmitting || multiLinkList.length > 0}
                                                rows={3}
                                            />
                                        </div>
                                    )
                                } else {
                                    return (
                                        <div className="form-group mb-3">
                                            <label className="form-label text-dark">Số lượng: <span id="quantity_limit">({min} ~ {max})</span></label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={quantity}
                                                // min={min}
                                                // max={max}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setQuantity(val === "" ? "" : Number(val));
                                                    setMultiLinkList(list => list.map(it => ({ ...it, quantity: val })));

                                                }}

                                                disabled={isSubmitting || multiLinkList.length > 0}
                                            />
                                        </div>
                                    );
                                }
                            })()}
                            {/* <div className="form-group mb-3">
                                <label className="form-label text-dark">Số lượng: <span id="quantity_limit">({min} ~ {max})</span></label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={quantity}
                                    min={min}
                                    max={max}
                                    onChange={e => setQuantity(Number(e.target.value))}
                                    disabled={isSubmitting}
                                />
                            </div>
                            {selectedService && selectedService.comment === "on" && (
                                <div className="form-group mb-3">
                                    <label className="form-label text-dark">
                                        Nhập Comment (áp dụng cho tất cả link, mỗi dòng 1 comment)
                                        <b> Số lượng cmt: <span style={{ color: "red" }}>{comments.split("\n").filter(c => c.trim() !== "").length}</span></b>
                                    </label>
                                    <textarea
                                        className="form-control"
                                        placeholder="Mỗi dòng 1 comment, sẽ áp dụng cho tất cả link khi thêm vào danh sách"
                                        value={comments}
                                        onChange={e => setComments(e.target.value)}
                                        disabled={isSubmitting}
                                        rows={3}
                                    />
                                </div>
                            )} */}
                            <div className="form-group mb-3">
                                <label className="form-label text-dark">
                                    Nhập Link <b>Số lượng link nhập <span style={{ color: "red" }}>{multiLinkInput.split("\n").filter(l => l.trim() !== "").length}</span></b>
                                </label>
                                <div className="input-group">
                                    <textarea
                                        className="form-control"
                                        placeholder="Mỗi dòng 1 link, nhập nhiều link và nhấn Thêm"
                                        value={multiLinkInput}
                                        onChange={e => {
                                            setMultiLinkInput(e.target.value);
                                            setShowServerWarning(false);
                                        }}
                                        disabled={isSubmitting || multiLinkList.length > 0}
                                        rows={5}
                                    />

                                </div>
                                {showServerWarning && (
                                    <div className="alert alert-warning mt-2 py-2 px-3" style={{ fontSize: 14 }}>
                                        <b>Chưa chọn máy chủ:</b> Vui lòng chọn máy chủ trước khi thêm link.
                                    </div>
                                )}
                            </div>
                            <Button
                                className="btn btn-info btn-sm"
                                variant="info"
                                size="sm"
                                onClick={handleAddLinks}
                                disabled={isSubmitting || multiLinkInput.split("\n").filter(l => l.trim() !== "").length === 0}
                            >
                                Thêm vào danh sách
                            </Button>
                        </div>
                        <div className="col-md-8 card card-body">

                            <div className="table-responsive">
                                <Button className="mb-2 me-2" variant="danger" size="sm" onClick={() => {
                                    setMultiLinkList([]);
                                    setSelectedMultiLinks([]);
                                }} disabled={isSubmitting || multiLinkList.length === 0}>
                                    Xóa nhanh tất cả
                                </Button>
                                <Button className="mb-2" variant="warning" size="sm" onClick={() => {
                                    setMultiLinkList(list => list.filter((_, idx) => !selectedMultiLinks.includes(idx)));
                                    setSelectedMultiLinks([]);
                                }} disabled={isSubmitting || multiLinkList.length === 0}>
                                    Xóa các đơn đã chọn
                                </Button>

                                <Table hover size="sm" className="mb-0">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th><input type="checkbox" onChange={handleCheckAll} checked={selectedMultiLinks.length === multiLinkList.length && multiLinkList.length > 0} /></th>
                                            <th>Thao tác</th>
                                            <th>Trạng thái</th>
                                            <th>Link</th>
                                            <th>Số lượng</th>
                                            <th>Giá</th>
                                            <th>Tạm tính</th>
                                            {selectedService && selectedService.comment === "on" && <th>Bình luận</th>}
                                            <th>Máy chủ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {multiLinkList.length === 0 ? (
                                            <tr><td colSpan={selectedService && selectedService.comment === "on" ? 10 : 9} className="text-center">Chưa có link nào</td></tr>
                                        ) : (
                                            multiLinkList.map((item, idx) => {
                                                const server = filteredServers.find(s => s.Magoi === selectedMagoi);
                                                return (
                                                    <tr key={idx} className={selectedMultiLinks.includes(idx) ? "table-info" : ""}>
                                                        <td>{idx + 1}</td>
                                                        <td>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedMultiLinks.includes(idx)}
                                                                onChange={e => {
                                                                    if (e.target.checked) {
                                                                        setSelectedMultiLinks(sel => [...sel, idx]);
                                                                    } else {
                                                                        setSelectedMultiLinks(sel => sel.filter(i => i !== idx));
                                                                    }
                                                                }}
                                                            />
                                                        </td>
                                                        <td>
                                                            <Button size="sm" variant="danger" onClick={() => {
                                                                setMultiLinkList(list => list.filter((_, i) => i !== idx));
                                                                setSelectedMultiLinks(sel => sel
                                                                    .filter(i => i !== idx) // loại bỏ index vừa xóa
                                                                    .map(i => i > idx ? i - 1 : i) // cập nhật lại index các phần tử phía sau
                                                                );
                                                            }}>Xóa</Button>
                                                        </td>
                                                        <td>
                                                            <span className={
                                                                item.status === 200 || /success|thành công/i.test(item.trangthai)
                                                                    ? "badge bg-success"
                                                                    : item.status === 500 || /error|thất bại|lỗi|fail/i.test(item.trangthai)
                                                                        ? "badge bg-danger"
                                                                        : item.status === 1 || /đang xử lý/i.test(item.trangthai)
                                                                            ? "badge bg-warning text-dark"
                                                                            : "badge bg-secondary"
                                                            }>
                                                                {item.trangthai || "Chờ mua"}
                                                            </span>
                                                        </td>
                                                        <td style={{ wordBreak: 'break-all' }}>{item.link}</td>
                                                        <td>
                                                            {selectedService && selectedService.comment === "on"
                                                                ? (item.comment ? item.comment.split("\n").filter(c => c.trim() !== "").length : 0)
                                                                : <input
                                                                    type="number"
                                                                    min={min}
                                                                    max={max}
                                                                    className="form-control form-control-sm"
                                                                    style={{ width: 80 }}
                                                                    value={typeof item.quantity !== 'undefined' ? item.quantity : quantity}
                                                                    onChange={e => {
                                                                        const val = e.target.value;
                                                                        setMultiLinkList(list => list.map((it, i) => i === idx ? { ...it, quantity: val === "" ? "" : Number(val) } : it));
                                                                    }}
                                                                    disabled={isSubmitting}
                                                                />
                                                            }
                                                        </td>
                                                        <td>{server ? Number(server.rate).toLocaleString('en-US') : ''}đ</td>
                                                        <td>
                                                            {server
                                                                ? (
                                                                    selectedService && selectedService.comment === "on"
                                                                        ? ((item.comment ? item.comment.split("\n").filter(c => c.trim() !== "").length : 0) * Number(server.rate)).toLocaleString("en-US")
                                                                        : (typeof item.quantity !== 'undefined' && item.quantity !== "")
                                                                            ? (Number(item.quantity) * Number(server.rate)).toLocaleString("en-US")
                                                                            : (quantity * Number(server.rate)).toLocaleString("en-US")
                                                                )
                                                                : ''
                                                            }đ
                                                        </td>
                                                        {/* <td>{server ? ((selectedService && selectedService.comment === "on") ? comments.split("\n").filter(c => c.trim() !== "").length : quantity) * Number(server.rate).toLocaleString("en-US") : ''}đ</td> */}
                                                        {selectedService && selectedService.comment === "on" && (
                                                            <td style={{ whiteSpace: 'pre-line' }}>
                                                                <textarea
                                                                    value={item.comment || ''}
                                                                    onChange={e => {
                                                                        const val = e.target.value;
                                                                        const qty = val.split("\n").filter(c => c.trim() !== "").length;
                                                                        setMultiLinkList(list => list.map((it, i) => i === idx ? { ...it, comment: val, quantity: qty } : it));
                                                                    }}
                                                                    style={{ width: "100%", minHeight: 40, resize: "vertical" }}
                                                                    disabled={isSubmitting}
                                                                />
                                                            </td>
                                                        )}
                                                        <td>{server ? server.name : ''}</td>

                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-footer d-flex flex-column align-items-stretch">
                    <div className="mb-2 text-end">
                        <b>Tổng số link chọn: <span style={{ color: 'red' }}>{totalSelected}</span></b>
                        <b className="ms-3">Tổng tiền: <span style={{ color: 'red', fontSize: 18 }}>
                            {multiLinkList && multiLinkList.length > 0
                                ? selectedMultiLinks.reduce((sum, idx) => {
                                    const item = multiLinkList[idx];
                                    const server = filteredServers.find(s => s.Magoi === selectedMagoi);
                                    const qty = selectedService && selectedService.comment === "on"
                                        ? (item.comment ? item.comment.split("\n").filter(c => c.trim() !== "").length : 0)
                                        : (typeof item.quantity !== 'undefined' && item.quantity !== "")
                                            ? Number(item.quantity)
                                            : quantity;
                                    return sum + (server ? qty * Number(server.rate) : 0);
                                }, 0).toLocaleString('en-US')
                                : '0'}
                        </span> VNĐ</b>
                    </div>
                    <div className="d-flex gap-2 justify-content-end">
                        <Button variant="secondary" size="sm" onClick={onHide} disabled={isSubmitting}>
                            Đóng (Vẫn mua đơn)
                        </Button>

                        <Button variant="info" size="sm" onClick={handleMultiLinkSubmit} disabled={isSubmitting || multiLinkList.length === 0 || !selectedMagoi || !quantity}>
                            {isSubmitting ? "Đang xử lý..." : "Mua hàng"}
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setIsStopped(prev => !prev)}
                            disabled={!isSubmitting && !isStopped}
                        >
                            {isStopped ? "Tiếp tục mua" : "Dừng mua"}
                        </Button>
                    </div>
                    {isStopped && (
                        <div className="alert alert-danger text-center mt-2">Đã dừng mua đơn tiếp theo, vui lòng chờ thực hiện xong đơn đang xử lý.</div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
