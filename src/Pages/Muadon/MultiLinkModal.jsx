import { useEffect } from "react";
import React from "react";
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
    cmtqty,
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
                                                onChange={e => setComments(e.target.value)}
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
                                                min={min}
                                                max={max}
                                                onChange={e => setQuantity(Number(e.target.value))}
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
                                        onChange={e => setMultiLinkInput(e.target.value)}
                                        disabled={isSubmitting || multiLinkList.length > 0}
                                        rows={5}
                                    />

                                </div>
                            </div>
                            <Button
                                className="btn btn-info btn-sm"
                                variant="info"
                                size="sm"
                                onClick={() => {
                                    const newLinks = multiLinkInput
                                        .split("\n")
                                        .map(l => l.trim())
                                        .filter(l => l !== "" && !multiLinkList.some(item => item.link === l));
                                    if (newLinks.length > 0) {
                                        // Sử dụng biến comments từ props, không khai báo lại
                                        const commentArr = comments
                                            .split("\n")
                                            .map(c => c.trim())
                                            .filter(c => c !== "");
                                        setMultiLinkList(list => [
                                            ...list,
                                            ...newLinks.map(link => ({ link, comment: commentArr.join("\n"), }))
                                        ]);
                                        setMultiLinkInput("");
                                    }
                                }}
                                disabled={isSubmitting || !selectedMagoi || multiLinkInput.split("\n").filter(l => l.trim() !== "").length === 0}
                            >
                                Thêm vào danh sách
                            </Button>
                        </div>
                        <div className="col-md-8 card card-body">

                            <div className="table-responsive">
                                <Button className="mb-2" variant="danger" size="sm" onClick={() => {
                                    setMultiLinkList([]);
                                    setSelectedMultiLinks([]);
                                }} disabled={isSubmitting || multiLinkList.length === 0}>
                                    Xóa nhanh tất cả
                                </Button>
                                <Table hover size="sm" className="mb-0">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th><input type="checkbox" onChange={handleCheckAll} checked={selectedMultiLinks.length === multiLinkList.length && multiLinkList.length > 0} /></th>
                                            <th>Trạng thái</th>
                                            <th>Link</th>
                                            <th>Máy chủ</th>
                                            <th>Số lượng</th>
                                            <th>Giá</th>
                                            <th>Tạm tính</th>
                                            {selectedService && selectedService.comment === "on" && <th>Bình luận</th>}
                                            <th></th>
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
                                                        <td><span className="badge bg-success">Chờ mua</span></td>
                                                        <td style={{ wordBreak: 'break-all' }}>{item.link}</td>
                                                        <td>{server ? server.name : ''}</td>
                                                        <td>{(selectedService && selectedService.comment === "on") ? comments.split("\n").filter(c => c.trim() !== "").length : quantity}</td>
                                                        <td>{server ? Number(server.rate).toLocaleString('en-US') : ''}đ</td>
                                                        <td>{server ? ((selectedService && selectedService.comment === "on") ? comments.split("\n").filter(c => c.trim() !== "").length : quantity) * Number(server.rate).toLocaleString("en-US") : ''}đ</td>
                                                        {selectedService && selectedService.comment === "on" && (
                                                            <td style={{ whiteSpace: 'pre-line' }}>
                                                                <textarea value={item.comment} readOnly style={{ width: "100%", minHeight: 40, resize: "vertical" }} />
                                                            </td>
                                                        )}
                                                        <td>
                                                            <Button size="sm" variant="danger" onClick={() => {
                                                                setMultiLinkList(list => list.filter((_, i) => i !== idx));
                                                                setSelectedMultiLinks(sel => sel.filter(i => i !== idx));
                                                            }}>Xóa</Button>
                                                        </td>
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
                            {(selectedService && selectedService.comment === "on")
                                ? Number(comments.split("\n").filter(c => c.trim() !== "").length * Number(rate) * totalSelected).toLocaleString('en-US')
                                : (totalAmount ? totalAmount.toLocaleString('en-US') : '0')}
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
                        <div className="alert alert-danger text-center mt-2">Đã dừng mua, bạn có thể đóng modal hoặc chọn lại để tiếp tục.</div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
